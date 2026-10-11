"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, FileText, MapPin, UserRound } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateJobApplicationStatus, type JobApplicationStatus } from "@/app/actions/job-applications";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

type Applicant = {
  id: string;
  student_id: string;
  cv_url: string;
  message: string | null;
  status: JobApplicationStatus;
  created_at: string;
  student: {
    full_name: string | null;
    headline: string | null;
    avatar_url: string | null;
    qr_code_slug: string | null;
  } | null;
};

type ManagedJob = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  job_type: string | null;
  work_mode: string | null;
  application_deadline: string | null;
  is_active: boolean;
  created_at: string;
  applications: Applicant[];
};

const statusLabels: Record<JobApplicationStatus, string> = {
  submitted: "Trimisă",
  reviewing: "În evaluare",
  accepted: "Acceptată",
  rejected: "Respinsă",
};
const jobTypeLabels: Record<string, string> = {
  fulltime: "Full-time",
  parttime: "Part-time",
  internship: "Internship",
  contract: "Contract",
  volunteer: "Voluntariat",
  temporary: "Temporar",
  other: "Alt tip",
};
const workModeLabels: Record<string, string> = { onsite: "La sediu", hybrid: "Hibrid", remote: "Remote" };

function formatDate(value: string | null) {
  if (!value) return "Fără termen limită";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function CandidateRow({ applicant }: { applicant: Applicant }) {
  const [pending, startTransition] = useTransition();
  const student = applicant.student;
  const profileHref = student?.qr_code_slug ? "/portofoliu/" + student.qr_code_slug : "/portofoliu/" + applicant.student_id;

  function changeStatus(status: JobApplicationStatus) {
    startTransition(async () => {
      const result = await updateJobApplicationStatus(applicant.id, status);
      if ("error" in result) { toast.error(result.error); return; }
      toast.success("Statusul candidatului a fost actualizat.");
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ProfileAvatar src={student?.avatar_url ?? null} name={student?.full_name ?? "Student"} className="h-11 w-11" />
          <div className="min-w-0">
            <Link href={profileHref} className="inline-flex items-center gap-1 font-extrabold text-slate-950 hover:text-[#0e5e6f]">
              {student?.full_name || "Student EduLink"} <UserRound className="h-3.5 w-3.5" />
            </Link>
            <p className="truncate text-sm text-slate-600">{student?.headline || "Profil student"}</p>
            <p className="text-xs text-slate-500">Aplicat la {formatDate(applicant.created_at)}</p>
          </div>
        </div>
        <select value={applicant.status} disabled={pending} onChange={(event) => changeStatus(event.target.value as JobApplicationStatus)} aria-label={"Statusul aplicației lui " + (student?.full_name || "student")} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-[#026a81]">
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {applicant.message ? <p className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">{applicant.message}</p> : null}
      <a href={applicant.cv_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#026a81] px-3 py-2 text-sm font-bold text-white hover:bg-[#003747]">
        <FileText className="h-4 w-4" />Deschide CV-ul<ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

export function CompanyJobsManager({ jobs }: { jobs: ManagedJob[] }) {
  const applicationCount = jobs.reduce((total, job) => total + job.applications.length, 0);
  return (
    <section className="space-y-5">
      <div className="rounded-2xl bg-[linear-gradient(115deg,#003747,#0e5e6f_60%,#168a9b)] p-6 text-white sm:p-8">
        <p className="text-sm font-bold uppercase tracking-wider text-[#a7edf1]">Recrutare EduLink</p>
        <h1 className="mt-2 text-3xl font-extrabold">Joburile și candidații tăi</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">Vezi toate joburile publicate, accesează CV-urile și deschide profilul public al fiecărui student.</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
          <span className="rounded-full bg-white/15 px-3 py-1.5">{jobs.length} joburi publicate</span>
          <span className="rounded-full bg-white/15 px-3 py-1.5">{applicationCount} aplicații primite</span>
        </div>
      </div>
      {!jobs.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-9 w-9 text-[#168a9b]" />
          <h2 className="mt-3 text-lg font-extrabold text-slate-950">Nu ai publicat încă un job</h2>
          <p className="mt-2 text-sm text-slate-600">Publică un job din pagina companiei; după prima aplicare, candidatul va apărea aici.</p>
          <Link href="/dashboard/company#job-post" className="mt-5 inline-flex rounded-lg bg-[#026a81] px-4 py-2.5 text-sm font-bold text-white">Publică primul job</Link>
        </div>
      ) : jobs.map((job) => (
        <article key={job.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950">{job.title}</h2>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  {job.location ? <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span> : null}
                  <span>{jobTypeLabels[job.job_type || ""] || "Oportunitate"}</span>
                  <span>{workModeLabels[job.work_mode || ""] || "Mod de lucru flexibil"}</span>
                  <span>Termen: {formatDate(job.application_deadline)}</span>
                </div>
              </div>
              <span className={"rounded-full px-3 py-1 text-xs font-extrabold " + (job.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>{job.is_active ? "Publicat activ" : "Închis"}</span>
            </div>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p>
          </header>
          <div className="space-y-3 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-extrabold text-slate-950">Candidați ({job.applications.length})</h3>
              <span className="text-xs text-slate-500">CV-ul este disponibil pentru evaluare</span>
            </div>
            {job.applications.length ? job.applications.map((applicant) => <CandidateRow key={applicant.id} applicant={applicant} />) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-600">Încă nu există aplicații pentru acest job.</p>}
          </div>
        </article>
      ))}
    </section>
  );
}