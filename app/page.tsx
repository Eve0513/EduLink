import { redirect } from "next/navigation";
import { BottomSection } from "@/components/landing/bottom-section";
import { FeaturesAndAudience } from "@/components/landing/features-and-audience";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Navbar } from "@/components/landing/navbar";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role, onboarding_completed").eq("id", user.id).maybeSingle();
    if (!profile?.onboarding_completed) redirect("/onboarding");
    redirect(profile.role === "student" ? "/feed" : "/dashboard");
  }
  return <main className="min-h-screen bg-[#F8FAFC]"><Navbar /><HeroSection /><FeaturesAndAudience /><BottomSection /><Footer /></main>;
}
