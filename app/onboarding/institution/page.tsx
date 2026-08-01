import { redirect } from "next/navigation";
import { OrganizationOnboardingWizard } from "@/components/onboarding/organization-onboarding-wizard";
import { createClient } from "@/lib/supabase/server";

export default async function InstitutionOnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role,onboarding_completed").eq("id", user.id).single();
  if (profile?.onboarding_completed) redirect("/dashboard/institution");
  if (profile?.role !== "institution") redirect("/onboarding");
  return <OrganizationOnboardingWizard kind="institution" />;
}
