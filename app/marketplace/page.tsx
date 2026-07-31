import { redirect } from "next/navigation";
import { BriefcaseBusiness, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function MarketplacePage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  const { data: jobs } = await supabase.from("jobs").select("id,title,description,location,job_type,work_mode,created_at").eq("is_active", true).order("created_at", { ascending: false }).limit(30);
  return <main className="min-h-screen bg-[#f3f6f7] p-5 sm:p-8"><div className="mx-auto max-w-5xl"><header className="rounded-2xl bg-[#003747] p-7 text-white"><p className="text-sm font-bold text-[#9ce7ed]">OPORTUNITĂȚI EDULINK</p><h1 className="mt-2 text-3xl font-extrabold">Joburi și internship-uri</h1><p className="mt-2 text-white/80">Alege oportunitatea potrivită și aplică din profilul tău.</p></header><div className="mt-6 grid gap-4 md:grid-cols-2">{(jobs ?? []).map((job) => <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><BriefcaseBusiness className="h-7 w-7 text-[#026a81]" /><h2 className="mt-4 text-xl font-bold">{job.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p><p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4" />{job.location ?? "Locație flexibilă"}</p><button className="mt-5 rounded-lg bg-[#026a81] px-4 py-2 text-sm font-bold text-white hover:bg-[#003747]">Aplică din profil</button></article>)}{!jobs?.length && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 md:col-span-2">Nu există joburi active încă.</p>}</div></div></main>;
}
