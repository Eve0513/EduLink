import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentOnboardingWizard } from "@/components/onboarding/student-wizard";

export default async function StudentOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("headline, role")
    .eq("id", user.id)
    .single();

  if (profile?.headline) {
    redirect("/dashboard/student/profile");
  }

  if (profile?.role !== "student") {
    redirect("/onboarding");
  }

  return <StudentOnboardingWizard />;
}
