import { BriefcaseBusiness, CheckCircle2, MapPin, SlidersHorizontal } from "lucide-react";
import { redirect } from "next/navigation";
import { JobApplicationCard } from "@/components/feed/job-application-card";
import { StudentHeader } from "@/components/dashboard/student-header";
import { createClient } from "@/lib/supabase/server";

type AccountRole = "student" | "company" | "institution";
type Job = { id: string; title: string; description: string; requirements: string | null; location: string | null; job_type: string | null; work_mode: string | null; application_deadline: string | null; application_link: string | null; company_id: string; created_at: string; company_name: string | null };
type Application = { id: string; job_id: string; status: string; created_at: string };

const statusLabels: Record<string, string> = { submitted: "Trimisă", reviewing: "În evaluare", accepted: "Acceptată", rejected: "Închisă" };

function formatDate(value: string | null) {
  if (!value) return "Fără termen limită";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: rawJobs }, { data: rawApplications }] = await Promise.all([
    supabase.from("profiles").select("full_name,avatar_url,role").eq("id", user.id).single(),
    supabase.from("jobs").select("id,title,description,requirements,location,job_type,work_mode,application_deadline,application_link,company_id,created_at").eq("is_active", true).order("created_at", { ascending: false }).limit(60),
    supabase.from("job_applications").select("id,job_id,status,created_at").eq("student_id", user.id).order("created_at", { ascending: false }),
  ]);
  if (!profile) redirect("/onboarding");

  const rawJobRows = (rawJobs ?? []) as Array<Omit<Job, "company_name">>;
  const companyIds = [...new Set(rawJobRows.map((job) => job.company_id))];
  const { data: companies } = companyIds.length ? await supabase.from("companies").select("created_by,name").in("created_by", companyIds) : { data: [] };
  const companyNames = new Map((companies ?? []).map((company) => [company.created_by, company.name]));
  const jobs = rawJobRows.map((job) => ({ ...job, company_name: companyNames.get(job.company_id) ?? null }));
  const applications = (rawApplications ?? []) as Application[];
  const appliedIds = new Set(applications.map((application) => application.job_id));
  const appliedJobs = applications.map((application) => ({ application, job: jobs.find((job) => job.id === application.job_id) })).filter((item): item is { application: Application; job: Job } => Boolean(item.job));
  const availableJobs = jobs.filter((job) => !appliedIds.has(job.id));
  const role = (profile.role === "company" || profile.role === "institution" ? profile.role : "student") as AccountRole;

  return <main className="min-h-screen bg-[#f5f8f9]"><StudentHeader name={profile.full_name} avatarUrl={profile.avatar_url} current="jobs" role={role} /><div className="mx-auto max-w-6xl px-4 py-7 sm:px-6"><header className="rounded-2xl bg-[linear-gradient(115deg,#003747,#0e5e6f_60%,#168a9b)] p-7 text-white sm:p-9"><p className="text-sm font-bold text-[#a7edf1]">OPORTUNITĂȚI EDULINK</p><h1 className="mt-2 text-3xl font-extrabold">Joburi și internship-uri</h1><p className="mt-2 text-white/85">Vezi ofertele publice ale companiilor și aplică direct cu CV-ul tău.</p></header>
      {appliedJobs.length ? <section className="mt-6 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-[#168a9b]" /><h2 className="text-lg font-extrabold text-slate-950">Joburi la care ai aplicat</h2></div><div className="mt-4 grid gap-3 md:grid-cols-2">{appliedJobs.map(({ application, job }) => <article key={application.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#0e5e6f]">{job.company_name || "Companie EduLink"}</p><h3 className="mt-1 font-extrabold text-slate-950">{job.title}</h3><p className="mt-2 text-sm text-slate-600">Status: <span className="font-bold text-slate-800">{statusLabels[application.status] || application.status}</span></p><p className="mt-1 text-xs text-slate-500">Trimisă la {formatDate(application.created_at)}</p></article>)}</div></section> : null}
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]"><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 font-extrabold text-slate-900"><SlidersHorizontal className="h-4 w-4 text-[#0e5e6f]" />Filtre</h2><p className="mt-3 text-sm leading-6 text-slate-600">Explorează ofertele active. Pentru o căutare exactă, folosește bara de căutare EduLink.</p><p className="mt-4 rounded-lg bg-[#e5f4f6] p-3 text-sm font-bold text-[#0e5e6f]">{availableJobs.length} oportunități disponibile</p></aside><div className="grid gap-4 md:grid-cols-2">{availableJobs.map((job) => <article key={job.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex-1"><JobApplicationCard job={job} canApply={role === "student"} /></div><p className="flex items-center gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />Termen: {formatDate(job.application_deadline)}</p></article>)}{!availableJobs.length ? <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center md:col-span-2"><BriefcaseBusiness className="mx-auto h-8 w-8 text-[#168a9b]" /><h2 className="mt-3 font-extrabold text-slate-900">Nu sunt încă joburi noi disponibile</h2><p className="mt-2 text-sm text-slate-600">Revino curând sau urmărește companiile relevante în feed.</p></section> : null}</div></div></div></main>;
}