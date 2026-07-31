import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AIHubClient } from "@/components/dashboard/ai-hub-client";

export default async function AIHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("qr_code_slug, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");
  return <AIHubClient portfolioSlug={profile.qr_code_slug} name={profile.full_name} avatarUrl={profile.avatar_url} />;
}
