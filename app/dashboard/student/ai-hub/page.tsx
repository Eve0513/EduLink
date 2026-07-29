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
    .select("qr_code_slug")
    .eq("id", user.id)
    .single();

  return <AIHubClient portfolioSlug={profile?.qr_code_slug ?? null} />;
}
