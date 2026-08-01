import { redirect } from "next/navigation";
import { InviteCodeCard } from "@/components/dashboard/invite-code-card";
import { OrganizationHeader } from "@/components/dashboard/organization-header";
import { createClient } from "@/lib/supabase/server";

export default async function CompanySettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("company_members").select("company_id").eq("user_id", user.id).maybeSingle();
  const query = membership?.company_id ? supabase.from("companies").select("name, invite_code").eq("id", membership.company_id).maybeSingle() : supabase.from("companies").select("name, invite_code").eq("created_by", user.id).maybeSingle();
  const { data: company } = await query;
  if (!company) redirect("/onboarding/company");
  return <main className="min-h-screen bg-[#f3f6f7]"><OrganizationHeader kind="company" organizationName={company.name} /><div className="mx-auto max-w-3xl px-5 py-10"><p className="text-xs font-bold uppercase tracking-wider text-[#168a9b]">Administrație companie</p><h1 className="mt-2 text-3xl font-extrabold text-slate-950">Echipă și securitate</h1><p className="mt-2 text-slate-600">Gestionează accesul colegilor printr-un cod de invitație individual al companiei.</p><div className="mt-7"><InviteCodeCard code={company.invite_code} entity="companie" kind="company" /></div></div></main>;
}
