import { redirect } from "next/navigation";
import { PortfolioEditorClient } from "@/components/dashboard/portfolio-editor-client";
import { createClient } from "@/lib/supabase/server";

export default async function PortfolioEditorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("full_name,headline,bio,location,avatar_url,qr_code_slug").eq("id", user.id).single();
  if (!profile?.qr_code_slug) redirect("/onboarding");
  return <PortfolioEditorClient profile={profile} />;
}
