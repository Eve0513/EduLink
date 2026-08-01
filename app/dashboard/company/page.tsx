import Link from "next/link";
import { redirect } from "next/navigation";
import { BriefcaseBusiness, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { InviteCodeCard } from "@/components/dashboard/invite-code-card";

export default async function CompanyDashboard() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role, headline").eq("id", user.id).single(); if (profile?.role !== "company" || !profile.headline) redirect("/onboarding");
  const { data: company } = await supabase.from("companies").select("id, name, invite_code").eq("created_by", user.id).maybeSingle();
  const { count } = company ? await supabase.from("jobs").select("id", { count: "exact", head: true }).eq("company_id", company.id) : { count: 0 };
  return <main className="min-h-screen bg-[#f8fafc] p-5 sm:p-10"><div className="mx-auto max-w-5xl"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold text-[#168a9b]">DASHBOARD HR</p><h1 className="mt-1 text-3xl font-extrabold">{company?.name ?? "Compania ta"}</h1></div><Link href="/dashboard/company/settings" className="inline-flex items-center gap-2 rounded-lg border border-[#0e5e6f] px-4 py-2.5 text-sm font-bold text-[#0e5e6f]"><Settings className="h-4 w-4" />Setări</Link></div><div className="mt-8 grid gap-5 md:grid-cols-2"><section className="rounded-2xl bg-[#0e5e6f] p-6 text-white"><BriefcaseBusiness className="h-8 w-8" /><p className="mt-6 text-white/75">Joburi active</p><p className="text-4xl font-extrabold">{count ?? 0}</p><p className="mt-3 text-sm text-white/80">Creează joburi și gestionează aplicațiile candidaților din acest spațiu.</p></section><InviteCodeCard code={company?.invite_code ?? null} entity="companie" /></div></div></main>;
}
