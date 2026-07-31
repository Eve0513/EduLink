import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InviteCodeCard } from "@/components/dashboard/invite-code-card";
export default async function CompanySettingsPage() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login"); const { data: company } = await supabase.from("companies").select("name, invite_code").eq("created_by", user.id).maybeSingle(); return <main className="min-h-screen bg-[#f8fafc] p-5 sm:p-10"><div className="mx-auto max-w-3xl"><h1 className="mb-8 text-3xl font-extrabold">Setări companie</h1><InviteCodeCard code={company?.invite_code ?? null} entity="companie" /></div></main>; }
