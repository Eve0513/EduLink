import { redirect } from "next/navigation";
import { StudentProfileClient } from "@/components/dashboard/student-profile-client";
import { createClient } from "@/lib/supabase/server";

export default async function StudentProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: educations }, { data: experiences }, { data: skills }, { data: preferences }] = await Promise.all([
    supabase.from("profiles").select("full_name, email, headline, location, bio, avatar_url, qr_code_slug").eq("id", user.id).single(),
    supabase.from("educations").select("id, institution_name, degree, field_of_study, start_date, end_date, is_current").eq("profile_id", user.id).order("start_date", { ascending: false }),
    supabase.from("experiences").select("id, company_name, position_title, location, start_date, end_date, is_current, description").eq("profile_id", user.id).order("start_date", { ascending: false }),
    supabase.from("skills").select("id, name, level").eq("profile_id", user.id).order("created_at"),
    supabase.from("student_preferences").select("desired_job_titles").eq("profile_id", user.id).maybeSingle(),
  ]);

  if (!profile) redirect("/onboarding");
  return <StudentProfileClient profile={profile} educations={educations ?? []} experiences={experiences ?? []} skills={skills ?? []} desiredJobTitles={preferences?.desired_job_titles ?? []} />;
}
