import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomSection } from "@/components/landing/bottom-section";
import { FeaturesAndAudience } from "@/components/landing/features-and-audience";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Navbar } from "@/components/landing/navbar";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.onboarding_completed) redirect("/onboarding");
    if (profile.role === "student") redirect("/feed");
    redirect(`/dashboard/${profile.role}`);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar />
      <HeroSection />
      <FeaturesAndAudience />
      <BottomSection />
      <Footer />
    </main>
  );
}
