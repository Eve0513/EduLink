import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  DashboardSidebar,
  DashboardHeader,
} from "@/components/dashboard/sidebar";
import { ProfileEditor } from "@/components/dashboard/profile-editor";

export default async function StudentProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const { data: educations } = await supabase
    .from("educations")
    .select("*")
    .eq("profile_id", user.id);

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("profile_id", user.id);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar currentPath="/dashboard/student/profile" />
      <main className="md:pl-64">
        <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
          <DashboardHeader
            title="Profilul meu"
            subtitle="Editează informațiile — modificările se salvează automat"
          />
          <ProfileEditor profile={profile} />

          {educations && educations.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <h2 className="text-lg font-semibold">Educație</h2>
              <div className="mt-4 space-y-4">
                {educations.map((edu) => (
                  <div
                    key={edu.id}
                    className="border-b border-border pb-4 last:border-0"
                  >
                    <p className="font-medium">{edu.institution_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.degree} · {edu.field_of_study}
                      {edu.gpa && ` · Media: ${edu.gpa}`}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills && skills.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <h2 className="text-lg font-semibold">
                Aptitudini ({skills.length})
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                  >
                    {skill.name} · {skill.level}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
