import { redirect } from "next/navigation";
import { OrganizationOnboardingWizard } from "@/components/onboarding/organization-onboarding-wizard";
import { createClient } from "@/lib/supabase/server";

export default async function CompanyOnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role,onboarding_completed").eq("id", user.id).single();
  if (profile?.onboarding_completed) redirect("/dashboard/company");
  if (profile?.role !== "company") redirect("/onboarding");
  return <OrganizationOnboardingWizard kind="company" />;
}
