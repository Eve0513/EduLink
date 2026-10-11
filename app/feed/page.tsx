import { CalendarDays, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { CreatePostCard } from "@/components/feed/create-post-card";
import { EventApplicationCard } from "@/components/feed/event-application-card";
import { FollowButton } from "@/components/feed/follow-button";
import { JobApplicationCard } from "@/components/feed/job-application-card";
import { PostCard } from "@/components/feed/post-card";
import { StudentHeader } from "@/components/dashboard/student-header";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { createClient } from "@/lib/supabase/server";

type AccountRole = "student" | "company" | "institution";
type ProfileSummary = { id: string; full_name: string; headline: string | null; avatar_url: string | null; role: AccountRole; institution_id: string | null; followers_count: number | null };
type Author = { id: string; full_name: string; headline: string | null; avatar_url: string | null; role: AccountRole; institution_id: string | null };
type Post = { id: string; content: string; image_url: string | null; created_at: string; creator_id: string };
type Event = { id: string; title: string | null; description: string | null; location: string | null; start_date: string | null; start_time: string | null; event_type: string; image_url: string | null; creator_id: string; created_at: string };
type Job = { id: string; title: string; description: string; requirements: string | null; location: string | null; job_type: string | null; work_mode: string | null; application_deadline: string | null; application_link: string | null; company_id: string; created_at: string; company_name: string | null };
type Recommendation = { key: string; targetType: "user" | "company" | "institution"; targetId: string; name: string; meta: string; avatarUrl: string | null };

const eventLabels: Record<string, string> = { academic_lecture: "Prelegere", workshop_training: "Workshop", hackathon_contest: "Hackathon", student_project: "Proiect studențesc", career_fair: "Târg de cariere", networking_meetup: "Networking", volunteer_charity: "Voluntariat", webinar_online: "Webinar", sports_recreation: "Sport și recreere", other: "Eveniment" };

function eventDateLabel(event: Event) {
  const date = event.start_date ? new Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "short" }).format(new Date(`${event.start_date}T12:00:00`)) : "Data urmează";
  return `${date}${event.start_time ? ` · ${event.start_time.slice(0, 5)}` : ""}${event.location ? ` · ${event.location}` : ""}`;
}

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: meData } = await supabase.from("profiles").select("id,full_name,headline,avatar_url,role,institution_id,followers_count").eq("id", user.id).single();
  const me = meData as ProfileSummary;
  if (!me) redirect("/onboarding");

  const [{ data: following }, { data: rawPosts }, { data: rawEvents }, { data: rawJobs }, { data: companies }, { data: institutions }, { data: studentProfiles }] = await Promise.all([
    supabase.from("follows").select("target_type,target_id").eq("follower_id", user.id),
    supabase.from("posts").select("id,content,image_url,created_at,creator_id").order("created_at", { ascending: false }).limit(40),
    supabase.from("events").select("id,title,description,location,start_date,start_time,event_type,image_url,creator_id,created_at").gte("start_date", new Date().toISOString().slice(0, 10)).order("created_at", { ascending: false }).limit(30),
    supabase.from("jobs").select("id,title,description,requirements,location,job_type,work_mode,application_deadline,application_link,company_id,created_at").eq("is_active", true).order("created_at", { ascending: false }).limit(30),
    supabase.from("companies").select("id,name,sector,avatar_url,created_by").limit(30),
    supabase.from("institutions").select("id,name,type,city,avatar_url,created_by").eq("verified", true).limit(30),
    supabase.from("profiles").select("id,full_name,headline,avatar_url,role").eq("role", "student").neq("id", user.id).limit(30),
  ]);

  const companyOwnerMap = new Map((companies ?? []).map((company) => [company.created_by, { id: company.id, name: company.name, sector: company.sector, avatarUrl: company.avatar_url }]));
  const posts = (rawPosts ?? []) as Post[];
  const events = (rawEvents ?? []) as Event[];
  const jobs = ((rawJobs ?? []) as Array<Omit<Job, "company_name">>).map((job) => ({ ...job, company_name: companyOwnerMap.get(job.company_id)?.name ?? null }));
  const followedUserIds = new Set((following ?? []).filter((item) => item.target_type === "user").map((item) => item.target_id));
  const followedCompanyIds = new Set((following ?? []).filter((item) => item.target_type === "company").map((item) => item.target_id));
  const followedInstitutionIds = new Set((following ?? []).filter((item) => item.target_type === "institution").map((item) => item.target_id));

  const authorIds = [...new Set([...posts.map((item) => item.creator_id), ...events.map((item) => item.creator_id), ...jobs.map((item) => item.company_id)])];
  const [{ data: authors }, { data: reactionRows }] = await Promise.all([
    authorIds.length ? supabase.from("profiles").select("id,full_name,headline,avatar_url,role,institution_id").in("id", authorIds) : Promise.resolve({ data: [] }),
    posts.length ? supabase.from("post_reactions").select("post_id,profile_id").in("post_id", posts.map((post) => post.id)) : Promise.resolve({ data: [] }),
  ]);
  const authorMap = new Map((authors ?? []).map((profile) => [profile.id, profile as Author]));
  const reactionCount = new Map<string, number>();
  const reactedPostIds = new Set<string>();
  for (const row of reactionRows ?? []) {
    reactionCount.set(row.post_id, (reactionCount.get(row.post_id) ?? 0) + 1);
    if (row.profile_id === user.id) reactedPostIds.add(row.post_id);
  }

  function priority(authorId: string, kind: "post" | "event" | "job") {
    const author = authorMap.get(authorId);
    if (kind === "job") {
      const company = companyOwnerMap.get(authorId);
      return company && followedCompanyIds.has(company.id) ? 3 : 1;
    }
    if (followedUserIds.has(authorId)) return 3;
    if (author?.role === "company" && companyOwnerMap.get(authorId) && followedCompanyIds.has(companyOwnerMap.get(authorId)!.id)) return 3;
    if (author?.role === "institution" && followedInstitutionIds.has(authorId)) return 3;
    if (me.institution_id && author?.institution_id === me.institution_id) return 2;
    return 1;
  }

  const timeline = [
    ...posts.map((item) => ({ kind: "post" as const, createdAt: item.created_at, score: priority(item.creator_id, "post"), item })),
    ...events.map((item) => ({ kind: "event" as const, createdAt: item.created_at, score: priority(item.creator_id, "event"), item })),
    ...jobs.map((item) => ({ kind: "job" as const, createdAt: item.created_at, score: priority(item.company_id, "job"), item })),
  ].sort((left, right) => right.score - left.score || right.createdAt.localeCompare(left.createdAt)).slice(0, 36);

  const recommended: Recommendation[] = [
    ...(companies ?? []).filter((company) => !followedCompanyIds.has(company.id)).map((company) => ({ key: `company-${company.id}`, targetType: "company" as const, targetId: company.id, name: company.name, meta: company.sector || "Companie din Moldova", avatarUrl: company.avatar_url })),
    ...(institutions ?? []).filter((institution) => !followedInstitutionIds.has(institution.id)).map((institution) => ({ key: `institution-${institution.id}`, targetType: "institution" as const, targetId: institution.id, name: institution.name, meta: institution.city ? `${institution.type} · ${institution.city}` : institution.type, avatarUrl: institution.avatar_url })),
    ...(studentProfiles ?? []).filter((profile) => !followedUserIds.has(profile.id)).map((profile) => ({ key: `user-${profile.id}`, targetType: "user" as const, targetId: profile.id, name: profile.full_name, meta: profile.headline || "Student EduLink", avatarUrl: profile.avatar_url })),
  ].slice(0, 6);

  return <main className="min-h-screen bg-[#f3f6f7]">
    <StudentHeader name={me.full_name} avatarUrl={me.avatar_url} current="home" role={me.role} />
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[245px_minmax(0,1fr)_280px]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="-mx-5 -mt-5 h-16 rounded-t-2xl bg-[#0e5e6f]" /><ProfileAvatar src={me.avatar_url} name={me.full_name} className="-mt-7 h-14 w-14 border-4 border-white text-xl shadow-sm" /><h1 className="mt-3 font-bold">{me.full_name}</h1><p className="mt-1 text-sm text-slate-500">{me.headline || (me.role === "company" ? "Companie EduLink" : me.role === "institution" ? "Instituție EduLink" : "Student EduLink")}</p><div className="mt-5 grid grid-cols-2 border-y border-slate-100 py-3 text-center text-xs"><div><b className="block text-base text-[#0e5e6f]">{me.followers_count ?? 0}</b>Urmăritori</div><div><b className="block text-base text-[#0e5e6f]">{following?.length ?? 0}</b>Urmăriri</div></div><a href={me.role === "company" ? "/dashboard/company" : me.role === "institution" ? "/dashboard/institution" : "/dashboard/student/profile"} className="mt-4 flex items-center gap-2 text-sm font-bold text-[#0e5e6f]"><UserRound className="h-4 w-4" />{me.role === "student" ? "Vezi profilul" : "Vezi panoul"}</a></aside>
      <section className="space-y-5"><CreatePostCard name={me.full_name} />{timeline.map((entry) => entry.kind === "post" ? <PostCard key={`post-${entry.item.id}`} post={entry.item} author={authorMap.get(entry.item.creator_id)} reactionCount={reactionCount.get(entry.item.id) ?? 0} initialReacted={reactedPostIds.has(entry.item.id)} /> : entry.kind === "event" ? <EventApplicationCard key={`event-${entry.item.id}`} event={entry.item} canApply={me.role === "student"} /> : <JobApplicationCard key={`job-${entry.item.id}`} job={entry.item} canApply={me.role === "student"} />)}{!timeline.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">Feed-ul tău este pregătit. Urmărește organizații pentru conținut personalizat.</div> : null}</section>
      <aside className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Recomandat pentru tine</h2><p className="mt-1 text-xs text-slate-500">Conturi și organizații care pot fi relevante pentru tine.</p><div className="mt-4 space-y-4">{recommended.map((item) => <div key={item.key} className="flex items-center gap-2"><ProfileAvatar src={item.avatarUrl} name={item.name} className="h-9 w-9 shrink-0" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.name}</p><p className="truncate text-xs text-slate-500">{item.meta}</p></div><FollowButton targetType={item.targetType} targetId={item.targetId} initialIsFollowing={false} className="px-2" /></div>)}</div>{!recommended.length ? <p className="mt-4 text-sm text-slate-500">Urmărești deja recomandările disponibile.</p> : null}</section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Evenimente următoare</h2><p className="mt-1 text-xs text-slate-500">Vezi rapid ce se întâmplă în comunitate.</p><div className="mt-4 space-y-4">{events.slice(0, 4).map((event) => <div key={event.id} className="flex gap-3"><CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#168a9b]" /><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-wide text-[#168a9b]">{eventLabels[event.event_type] ?? "Eveniment"}</p><p className="truncate text-sm font-bold">{event.title ?? "Eveniment EduLink"}</p><p className="text-xs text-slate-500">{eventDateLabel(event)}</p></div></div>)}{!events.length ? <p className="text-sm text-slate-500">Nu sunt încă evenimente programate.</p> : null}</div></section></aside>
    </div>
  </main>;
}