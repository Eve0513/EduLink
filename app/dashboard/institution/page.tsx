import { redirect } from "next/navigation";
import { OrganizationDashboardClient } from "@/components/dashboard/organization-dashboard-client";
import { createClient } from "@/lib/supabase/server";

export default async function InstitutionDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, onboarding_completed").eq("id", user.id).maybeSingle();
  if (profile?.role !== "institution" || !profile.onboarding_completed) redirect("/onboarding");

  const { data: membership } = await supabase.from("institution_members").select("institution_id").eq("user_id", user.id).maybeSingle();
  const institutionQuery = membership?.institution_id
    ? supabase.from("institutions").select("id, name, website, city, type, sector, invite_code, avatar_url, background_url, description, founded_on, specializations").eq("id", membership.institution_id).maybeSingle()
    : supabase.from("institutions").select("id, name, website, city, type, sector, invite_code, avatar_url, background_url, description, founded_on, specializations").eq("created_by", user.id).maybeSingle();
  const { data: institution } = await institutionQuery;
  if (!institution) redirect("/onboarding/institution");

  const [{ count: followerCount }, { data: posts }, { data: events }] = await Promise.all([
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("target_type", "institution").eq("target_id", institution.id),
    supabase.from("posts").select("id, content, image_url, created_at").eq("creator_id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("events").select("id, title, description, location, start_date, start_time, event_type, image_url, created_at").eq("creator_id", user.id).order("created_at", { ascending: false }).limit(12),
  ]);

  return <OrganizationDashboardClient kind="institution" organization={{ id: institution.id, name: institution.name, website: institution.website, location: institution.city, sector: institution.sector || institution.type, inviteCode: institution.invite_code, avatarUrl: institution.avatar_url, backgroundUrl: institution.background_url, description: institution.description, foundedOn: institution.founded_on, specializations: institution.specializations ?? [] }} followerCount={followerCount ?? 0} posts={posts ?? []} events={events ?? []} />;
}
