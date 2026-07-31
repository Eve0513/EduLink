import { CalendarDays, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { CreatePostCard } from "@/components/feed/create-post-card";
import { FollowButton } from "@/components/feed/follow-button";
import { PostCard } from "@/components/feed/post-card";
import { StudentHeader } from "@/components/dashboard/student-header";
import { createClient } from "@/lib/supabase/server";

type ProfileSummary = { id: string; full_name: string; headline: string | null; avatar_url: string | null; role: string; institution_id: string | null };
type Post = { id: string; content: string; image_url: string | null; created_at: string; creator_id: string };

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: meData } = await supabase.from("profiles").select("id, full_name, headline, avatar_url, role, institution_id").eq("id", user.id).single();
  const me = meData as ProfileSummary | null;
  if (!me) redirect("/onboarding");

  const { data: following } = await supabase.from("follows").select("target_type, target_id").eq("follower_id", user.id);
  const userTargets = (following ?? []).filter((item) => item.target_type === "user").map((item) => item.target_id);
  const { data: recentPosts } = await supabase.from("posts").select("id, content, image_url, created_at, creator_id").order("created_at", { ascending: false }).limit(30);
  const allPosts = (recentPosts ?? []) as Post[];
  const prioritized = allPosts.filter((post) => userTargets.includes(post.creator_id) || (me.institution_id && post.creator_id !== me.id)).slice(0, 12);
  const posts = prioritized.length >= 5 ? prioritized : allPosts.slice(0, 12);
  const authorIds = [...new Set(posts.map((post) => post.creator_id))];
  const { data: authors } = authorIds.length ? await supabase.from("profiles").select("id, full_name, headline, avatar_url, role").in("id", authorIds) : { data: [] };
  const authorMap = new Map((authors ?? []).map((profile) => [profile.id, profile]));
  const { data: candidates } = await supabase.from("companies").select("id, name, sector").limit(6);
  const followedCompanyIds = new Set((following ?? []).filter((item) => item.target_type === "company").map((item) => item.target_id));
  const { data: events } = await supabase.from("events").select("id, title, start_date, event_type").gte("start_date", new Date().toISOString().slice(0, 10)).order("start_date").limit(3);

  return <main className="min-h-screen bg-[#f3f6f7]"><StudentHeader name={me.full_name} avatarUrl={me.avatar_url} current="home" /><div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[245px_minmax(0,1fr)_280px]"><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="-mx-5 -mt-5 h-16 rounded-t-2xl bg-[#0e5e6f]" /><div className="-mt-7 grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-[#e5f4f6] text-xl font-bold text-[#0e5e6f]">{me.full_name.slice(0, 1)}</div><h1 className="mt-3 font-bold">{me.full_name}</h1><p className="mt-1 text-sm text-slate-500">{me.headline || "Student EduLink"}</p><div className="mt-5 grid grid-cols-2 border-y border-slate-100 py-3 text-center text-xs"><div><b className="block text-base text-[#0e5e6f]">0</b>Vizualizări</div><div><b className="block text-base text-[#0e5e6f]">{following?.length ?? 0}</b>Urmăriri</div></div><a href="/dashboard/student/profile" className="mt-4 flex items-center gap-2 text-sm font-bold text-[#0e5e6f]"><UserRound className="h-4 w-4" />Vezi profilul</a></aside><section className="space-y-5"><CreatePostCard name={me.full_name} />{posts.length ? posts.map((post) => <PostCard key={post.id} post={post} author={authorMap.get(post.creator_id)} />) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">Feed-ul tău este pregătit. Urmărește organizații pentru conținut personalizat.</div>}</section><aside className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Recomandat pentru tine</h2><div className="mt-4 space-y-4">{(candidates ?? []).filter((company) => !followedCompanyIds.has(company.id)).slice(0, 3).map((company) => <div key={company.id} className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#e5f4f6] font-bold text-[#0e5e6f]">{company.name.slice(0, 1)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{company.name}</p><p className="truncate text-xs text-slate-500">{company.sector ?? "Companie parteneră"}</p></div><FollowButton targetType="company" targetId={company.id} initialIsFollowing={false} className="px-2" /></div>)}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Evenimente viitoare</h2><div className="mt-4 space-y-4">{(events ?? []).map((event) => <div key={event.id} className="flex gap-3"><CalendarDays className="mt-0.5 h-5 w-5 text-[#168a9b]" /><div><p className="text-sm font-bold">{event.title ?? "Eveniment EduLink"}</p><p className="text-xs text-slate-500">{event.start_date ?? "Data urmează"} · {event.event_type}</p></div></div>)}</div></section></aside></div></main>;
}
