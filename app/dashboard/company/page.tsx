import { redirect } from "next/navigation";
import { OrganizationDashboardClient } from "@/components/dashboard/organization-dashboard-client";
import { createClient } from "@/lib/supabase/server";

export default async function CompanyDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, onboarding_completed, bio").eq("id", user.id).maybeSingle();
  if (profile?.role !== "company" || !profile.onboarding_completed) redirect("/onboarding");

  const { data: membership } = await supabase.from("company_members").select("company_id").eq("user_id", user.id).maybeSingle();
  const companyQuery = membership?.company_id
    ? supabase.from("companies").select("id, name, website, location, sector, invite_code").eq("id", membership.company_id).maybeSingle()
    : supabase.from("companies").select("id, name, website, location, sector, invite_code").eq("created_by", user.id).maybeSingle();
  const { data: company } = await companyQuery;
  if (!company) redirect("/onboarding/company");

  const [{ count: followerCount }, { data: posts }, { data: events }] = await Promise.all([
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("target_type", "company").eq("target_id", company.id),
    supabase.from("posts").select("id, content, image_url, created_at").eq("creator_id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("events").select("id, title, description, location, start_date, start_time, event_type, created_at").eq("creator_id", user.id).order("created_at", { ascending: false }).limit(12),
  ]);

  return <OrganizationDashboardClient kind="company" organization={{ id: company.id, name: company.name, website: company.website, location: company.location, sector: company.sector, inviteCode: company.invite_code, description: profile.bio }} followerCount={followerCount ?? 0} posts={posts ?? []} events={events ?? []} />;
}
