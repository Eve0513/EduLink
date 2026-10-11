import { redirect } from "next/navigation";
import { CompanyJobsManager } from "@/components/dashboard/company-jobs-manager";
import { OrganizationHeader } from "@/components/dashboard/organization-header";
import { createClient } from "@/lib/supabase/server";

type JobRow = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  job_type: string | null;
  work_mode: string | null;
  application_deadline: string | null;
  is_active: boolean;
  created_at: string;
};
type ApplicationRow = {
  id: string;
  job_id: string;
  student_id: string;
  cv_url: string;
  message: string | null;
  status: "submitted" | "reviewing" | "accepted" | "rejected";
  created_at: string;
};
type StudentRow = {
  id: string;
  full_name: string | null;
  headline: string | null;
  avatar_url: string | null;
  qr_code_slug: string | null;
};

export default async function CompanyJobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role,onboarding_completed").eq("id", user.id).maybeSingle();
  if (profile?.role !== "company" || !profile.onboarding_completed) redirect("/onboarding");

  const { data: membership } = await supabase.from("company_members").select("company_id").eq("user_id", user.id).maybeSingle();
  const companyQuery = membership?.company_id
    ? supabase.from("companies").select("id,name").eq("id", membership.company_id).maybeSingle()
    : supabase.from("companies").select("id,name").eq("created_by", user.id).maybeSingle();

  const [{ data: company }, { data: rawJobs }] = await Promise.all([
    companyQuery,
    supabase.from("jobs").select("id,title,description,location,job_type,work_mode,application_deadline,is_active,created_at").eq("company_id", user.id).order("created_at", { ascending: false }),
  ]);

  const jobs = (rawJobs ?? []) as JobRow[];
  const jobIds = jobs.map((job) => job.id);
  const { data: rawApplications } = jobIds.length
    ? await supabase.from("job_applications").select("id,job_id,student_id,cv_url,message,status,created_at").in("job_id", jobIds).order("created_at", { ascending: false })
    : { data: [] as ApplicationRow[] };

  const applications = (rawApplications ?? []) as ApplicationRow[];
  const studentIds = [...new Set(applications.map((application) => application.student_id))];
  const { data: rawStudents } = studentIds.length
    ? await supabase.from("profiles").select("id,full_name,headline,avatar_url,qr_code_slug").in("id", studentIds)
    : { data: [] as StudentRow[] };

  const studentsById = new Map(((rawStudents ?? []) as StudentRow[]).map((student) => [student.id, student]));
  const applicationsByJob = new Map<string, ApplicationRow[]>();
  for (const application of applications) {
    applicationsByJob.set(application.job_id, [...(applicationsByJob.get(application.job_id) ?? []), application]);
  }

  const managedJobs = jobs.map((job) => ({
    ...job,
    applications: (applicationsByJob.get(job.id) ?? []).map((application) => ({
      ...application,
      student: studentsById.get(application.student_id) ?? null,
    })),
  }));

  return (
    <main className="min-h-screen bg-[#f3f6f7]">
      <OrganizationHeader kind="company" organizationName={company?.name ?? "Compania ta"} />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><CompanyJobsManager jobs={managedJobs} /></div>
    </main>
  );
}