import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, headline")
    .eq("id", user.id)
    .single();

  if (!profile?.headline) redirect("/onboarding");

  if (profile.role === "student") redirect("/feed");
  if (profile.role === "company") redirect("/dashboard/company");
  if (profile.role === "institution") redirect("/dashboard/institution");
  redirect("/onboarding");
}
