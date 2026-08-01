import { redirect } from "next/navigation";
import { BriefcaseBusiness, MapPin, SlidersHorizontal } from "lucide-react";
import { StudentHeader } from "@/components/dashboard/student-header";
import { createClient } from "@/lib/supabase/server";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: jobs }] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single(),
    supabase.from("jobs").select("id,title,description,location,job_type,work_mode,created_at").eq("is_active", true).order("created_at", { ascending: false }).limit(30),
  ]);
  if (!profile) redirect("/onboarding");
  return <main className="min-h-screen bg-[#f5f8f9]"><StudentHeader name={profile.full_name} avatarUrl={profile.avatar_url} current="jobs" /><div className="mx-auto max-w-6xl px-4 py-7 sm:px-6"><header className="rounded-2xl bg-[linear-gradient(115deg,#003747,#0e5e6f_60%,#168a9b)] p-7 text-white sm:p-9"><p className="text-sm font-bold text-[#a7edf1]">OPORTUNITĂȚI EDULINK</p><h1 className="mt-2 text-3xl font-extrabold">Joburi și internship-uri</h1><p className="mt-2 text-white/85">Alege oportunitatea potrivită și aplică din profilul tău EduLink.</p></header><div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]"><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 font-extrabold text-slate-900"><SlidersHorizontal className="h-4 w-4 text-[#0e5e6f]" />Filtre</h2><p className="mt-3 text-sm leading-6 text-slate-600">Filtrele după locație, domeniu și tip de angajare vor păstra căutarea ta în această sesiune.</p><button className="mt-4 w-full rounded-lg border border-[#0e5e6f] px-3 py-2 text-sm font-bold text-[#0e5e6f] hover:bg-[#e5f4f6]">Toate oportunitățile</button></aside><div className="grid gap-4 md:grid-cols-2">{(jobs ?? []).map((job) => <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><BriefcaseBusiness className="h-7 w-7 text-[#026a81]" /><h2 className="mt-4 text-xl font-bold text-slate-950">{job.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p><p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4" />{job.location ?? "Locație flexibilă"}</p><button className="mt-5 rounded-lg bg-[#026a81] px-4 py-2 text-sm font-bold text-white hover:bg-[#003747]">Aplică din profil</button></article>)}{!jobs?.length && <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center md:col-span-2"><BriefcaseBusiness className="mx-auto h-8 w-8 text-[#168a9b]" /><h2 className="mt-3 font-extrabold text-slate-900">Momentan nu sunt joburi active</h2><p className="mt-2 text-sm text-slate-600">Revino curând sau completează profilul ca să primești recomandări relevante.</p></section>}</div></div></div></main>;
}
