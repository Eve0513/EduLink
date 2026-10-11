import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, Building2, Search, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { FollowButton } from "@/components/feed/follow-button";
import { createClient } from "@/lib/supabase/server";

type SearchParams = { q?: string };
type ProfileResult = { id: string; full_name: string; headline: string | null; role: string; qr_code_slug: string | null; avatar_url: string | null };
type CompanyResult = { id: string; name: string; sector: string | null; location: string | null; avatar_url: string | null };
type InstitutionResult = { id: string; name: string; type: string; city: string | null; sector: string | null; avatar_url: string | null };
type JobResult = { id: string; title: string; description: string; requirements: string | null; location: string | null; job_type: string | null; work_mode: string | null };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 80);
  const supabase = await createClient();
  const { data: { user: viewer } } = await supabase.auth.getUser();
  const pattern = `%${query.replace(/[%,().*_]/g, "")}%`;
  const [profiles, companies, institutions, jobs] = query
    ? await Promise.all([
        supabase.from("profiles").select("id,full_name,headline,role,qr_code_slug,avatar_url").or(`full_name.ilike.${pattern},headline.ilike.${pattern},location.ilike.${pattern}`).limit(12),
        supabase.from("companies").select("id,name,sector,location,avatar_url").or(`name.ilike.${pattern},sector.ilike.${pattern},location.ilike.${pattern}`).limit(12),
        supabase.from("institutions").select("id,name,type,city,sector,avatar_url").or(`name.ilike.${pattern},type.ilike.${pattern},city.ilike.${pattern},sector.ilike.${pattern}`).limit(12),
        supabase.from("jobs").select("id,title,description,requirements,location,job_type,work_mode").eq("is_active", true).or(`title.ilike.${pattern},description.ilike.${pattern},requirements.ilike.${pattern},location.ilike.${pattern},job_type.ilike.${pattern},work_mode.ilike.${pattern}`).limit(12),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];
  const profileRows = (profiles.data ?? []) as ProfileResult[];
  const companyRows = (companies.data ?? []) as CompanyResult[];
  const institutionRows = (institutions.data ?? []) as InstitutionResult[];
  const jobRows = (jobs.data ?? []) as JobResult[];
  const { data: followRows } = viewer ? await supabase.from("follows").select("target_type,target_id").eq("follower_id", viewer.id) : { data: [] };
  const following = new Set((followRows ?? []).map((item) => `${item.target_type}:${item.target_id}`));
  const hasResults = Boolean(profileRows.length || companyRows.length || institutionRows.length || jobRows.length);

  return (
    <main className="min-h-screen bg-[#f3f6f7]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
          <Link href="/feed" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#0e5e6f]"><ArrowLeft className="h-4 w-4" />Înapoi la feed</Link>
          <form className="flex w-full gap-2" action="/search"><label className="flex flex-1 items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><Search className="h-4 w-4 text-slate-500" /><input name="q" defaultValue={query} placeholder="Caută persoane, companii, instituții, joburi..." className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500" /></label><button className="rounded-lg bg-[#026a81] px-4 text-sm font-bold text-white hover:bg-[#003747]">Caută</button></form>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-5">
        <h1 className="text-2xl font-extrabold text-slate-950">{query ? `Rezultate pentru „${query}”` : "Caută în EduLink"}</h1>
        <p className="mt-2 text-slate-600">Căutarea verifică nume, domenii, locații, descrieri și cerințe de job.</p>
        {query && !hasResults ? <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">Nu am găsit rezultate publice pentru această căutare.</p> : null}
        <div className="mt-6 space-y-8">
          {profileRows.length ? <ResultGroup title="Persoane"><div className="grid gap-4 md:grid-cols-2">{profileRows.map((profile) => <Result key={`profile-${profile.id}`} icon={<UserRound />} title={profile.full_name} meta={profile.headline || roleLabel(profile.role)} href={profile.qr_code_slug ? `/portofoliu/${profile.qr_code_slug}` : "/feed"} action={profile.id !== viewer?.id ? <FollowButton targetType="user" targetId={profile.id} initialIsFollowing={following.has(`user:${profile.id}`)} /> : null} />)}</div></ResultGroup> : null}
          {companyRows.length ? <ResultGroup title="Companii"><div className="grid gap-4 md:grid-cols-2">{companyRows.map((company) => <Result key={`company-${company.id}`} icon={<Building2 />} title={company.name} meta={[company.sector, company.location].filter(Boolean).join(" · ") || "Companie"} href={`/organizations/company/${company.id}`} action={<FollowButton targetType="company" targetId={company.id} initialIsFollowing={following.has(`company:${company.id}`)} />} />)}</div></ResultGroup> : null}
          {institutionRows.length ? <ResultGroup title="Instituții"><div className="grid gap-4 md:grid-cols-2">{institutionRows.map((institution) => <Result key={`institution-${institution.id}`} icon={<Building2 />} title={institution.name} meta={[institution.type, institution.city].filter(Boolean).join(" · ") || "Instituție"} href={`/organizations/institution/${institution.id}`} action={<FollowButton targetType="institution" targetId={institution.id} initialIsFollowing={following.has(`institution:${institution.id}`)} />} />)}</div></ResultGroup> : null}
          {jobRows.length ? <ResultGroup title="Joburi"><div className="grid gap-4 md:grid-cols-2">{jobRows.map((job) => <Result key={`job-${job.id}`} icon={<BriefcaseBusiness />} title={job.title} meta={[job.job_type, job.work_mode, job.location].filter(Boolean).join(" · ") || "Oportunitate"} href="/marketplace" />)}</div></ResultGroup> : null}
        </div>
      </section>
    </main>
  );
}

function ResultGroup({ title, children }: { title: string; children: ReactNode }) { return <section><h2 className="mb-3 text-lg font-extrabold text-slate-950">{title}</h2>{children}</section>; }
function Result({ icon, title, meta, href, action }: { icon: ReactNode; title: string; meta: string; href: string; action?: ReactNode }) { return <article className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#168a9b]"><Link href={href} className="flex min-w-0 flex-1 gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e5f4f6] text-[#0e5e6f]">{icon}</span><span className="min-w-0"><span className="block truncate font-bold text-slate-950">{title}</span><span className="mt-1 block truncate text-sm text-slate-600">{meta}</span></span></Link>{action}</article>; }
function roleLabel(role: string) { return role === "company" ? "Companie" : role === "institution" ? "Instituție" : "Student"; }