import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleSelectForm } from "@/components/onboarding/role-select-form";
import { Progress } from "@/components/ui/progress";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("onboarding_completed, role").eq("id", user.id).single();
  if (profile?.onboarding_completed) { if (profile.role === "student") redirect("/feed"); redirect(`/dashboard/${profile.role}`); }
  return <main className="relative min-h-screen overflow-hidden bg-[#f5f8f9]"><div className="pointer-events-none absolute -left-36 top-16 h-[28rem] w-[28rem] rounded-full bg-[#168a9b]/15 blur-3xl" /><div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#026a81]/10 blur-3xl" /><Progress value={10} className="relative rounded-none" /><div className="relative mx-auto max-w-4xl px-6 py-12"><section className="rounded-3xl border border-white bg-white/90 p-7 shadow-xl shadow-[#003747]/10 sm:p-10"><span className="inline-flex rounded-full bg-[#e5f4f6] px-3 py-1 text-xs font-bold text-[#0e5e6f]">BUN VENIT ÎN EDULINK</span><div className="mb-10 mt-5 space-y-2"><h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Alege rolul tău pe EduLink</h1><p className="max-w-2xl text-sm leading-6 text-slate-600">Rolul selectat determină funcționalitățile disponibile. Vei completa datele personale la pasul următor.</p></div><RoleSelectForm /></section></div></main>;
}
