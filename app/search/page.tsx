import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, Building2, Search, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 80);
  const supabase = await createClient();
  const pattern = `%${query.replace(/[%_]/g, "")}%`;
  const [profiles, companies, institutions, jobs] = query ? await Promise.all([
    supabase.from("profiles").select("id, full_name, headline, role, qr_code_slug").ilike("full_name", pattern).limit(8),
    supabase.from("companies").select("id, name, sector, location").ilike("name", pattern).limit(8),
    supabase.from("institutions").select("id, name, type, city").ilike("name", pattern).limit(8),
    supabase.from("jobs").select("id, title, location, job_type").eq("is_active", true).ilike("title", pattern).limit(8),
  ]) : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];
  const hasResults = Boolean(profiles.data?.length || companies.data?.length || institutions.data?.length || jobs.data?.length);

  return <main className="min-h-screen bg-[#f3f6f7]"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-[#0e5e6f]"><ArrowLeft className="h-4 w-4" />Înapoi la EduLink</Link><form className="ml-auto flex w-full max-w-md gap-2" action="/search"><label className="flex flex-1 items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><Search className="h-4 w-4 text-slate-500" /><input name="q" defaultValue={query} placeholder="Caută în EduLink" className="w-full bg-transparent text-sm outline-none" /></label><button className="rounded-lg bg-[#026a81] px-4 text-sm font-bold text-white">Caută</button></form></div></header><section className="mx-auto max-w-5xl px-5 py-9"><h1 className="text-2xl font-extrabold text-slate-950">{query ? `Rezultate pentru „${query}”` : "Caută în EduLink"}</h1>{!query ? <p className="mt-2 text-slate-600">Găsește persoane, companii, instituții și oportunități publicate.</p> : null}{query && !hasResults ? <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">Nu am găsit rezultate publice pentru această căutare.</p> : null}<div className="mt-6 grid gap-5 md:grid-cols-2">{(profiles.data ?? []).map((profile) => <Result key={profile.id} icon={<UserRound />} title={profile.full_name} meta={profile.headline || profile.role} href={profile.qr_code_slug ? `/portofoliu/${profile.qr_code_slug}` : "/feed"} />)}{(companies.data ?? []).map((company) => <Result key={company.id} icon={<Building2 />} title={company.name} meta={[company.sector, company.location].filter(Boolean).join(" · ") || "Companie"} href="/feed" />)}{(institutions.data ?? []).map((institution) => <Result key={institution.id} icon={<Building2 />} title={institution.name} meta={[institution.type, institution.city].filter(Boolean).join(" · ") || "Instituție"} href="/feed" />)}{(jobs.data ?? []).map((job) => <Result key={job.id} icon={<BriefcaseBusiness />} title={job.title} meta={[job.job_type, job.location].filter(Boolean).join(" · ") || "Oportunitate"} href="/marketplace" />)}</div></section></main>;
}

function Result({ icon, title, meta, href }: { icon: React.ReactNode; title: string; meta: string; href: string }) { return <Link href={href} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#168a9b]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e5f4f6] text-[#0e5e6f]">{icon}</span><span><span className="block font-bold text-slate-950">{title}</span><span className="mt-1 block text-sm text-slate-600">{meta}</span></span></Link>; }
