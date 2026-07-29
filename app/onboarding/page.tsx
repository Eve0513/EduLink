import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleSelectForm } from "@/components/onboarding/role-select-form";
import { Progress } from "@/components/ui/progress";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("headline, role")
    .eq("id", user.id)
    .single();

  if (profile?.headline) {
    redirect("/dashboard/student/profile");
  }

  return (
    <div className="min-h-screen bg-background">
      <Progress value={10} className="rounded-none" />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Alege rolul tău pe EduLink
          </h1>
          <p className="text-sm text-muted-foreground">
            Rolul selectat determină funcționalitățile disponibile. Poate fi
            schimbat doar o singură dată.
          </p>
        </div>
        <RoleSelectForm />
      </div>
    </div>
  );
}
