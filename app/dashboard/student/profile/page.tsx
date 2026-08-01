import { redirect } from "next/navigation";
import { StudentProfileClient } from "@/components/dashboard/student-profile-client";
import { createClient } from "@/lib/supabase/server";

export default async function StudentProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: educations }, { data: experiences }, { data: skills }, { data: projects }, { data: certificates }, { data: preferences }, { data: recommendations }] = await Promise.all([
    supabase.from("profiles").select("full_name, email, headline, location, bio, avatar_url, background_url, qr_code_slug").eq("id", user.id).single(),
    supabase.from("educations").select("id, institution_name, degree, field_of_study, start_date, end_date, is_current").eq("profile_id", user.id).order("start_date", { ascending: false }),
    supabase.from("experiences").select("id, company_name, position_title, location, work_mode, job_type, start_date, end_date, is_current, description").eq("profile_id", user.id).order("start_date", { ascending: false }),
    supabase.from("skills").select("id, name, level").eq("profile_id", user.id).order("name"),
    supabase.from("projects").select("id, title, description, github_url, live_demo_url, technologies, image_url").eq("profile_id", user.id).order("title"),
    supabase.from("certificates").select("id, title, issuing_organization, issue_date, expiry_date, credential_url").eq("profile_id", user.id).order("issue_date", { ascending: false }),
    supabase.from("student_preferences").select("desired_job_titles").eq("profile_id", user.id).maybeSingle(),
    supabase.from("recommendation_requests").select("id, recipient_name, recipient_email, relationship, message, status, created_at").eq("profile_id", user.id).order("created_at", { ascending: false }),
  ]);

  if (!profile) redirect("/onboarding");
  return <StudentProfileClient profile={profile} educations={educations ?? []} experiences={experiences ?? []} skills={skills ?? []} projects={projects ?? []} certificates={certificates ?? []} recommendations={recommendations ?? []} desiredJobTitles={preferences?.desired_job_titles ?? []} />;
}
