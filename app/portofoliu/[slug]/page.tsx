import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Code2, ExternalLink, MapPin } from "lucide-react";

interface PortfolioPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("qr_code_slug", slug)
    .single();

  if (!profile) notFound();

  const [
    { data: educations },
    { data: experiences },
    { data: projects },
    { data: skills },
  ] = await Promise.all([
    supabase.from("educations").select("*").eq("profile_id", profile.id),
    supabase.from("experiences").select("*").eq("profile_id", profile.id),
    supabase.from("projects").select("*").eq("profile_id", profile.id),
    supabase.from("skills").select("*").eq("profile_id", profile.id),
  ]);

  const initials = profile.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <Avatar className="mx-auto h-24 w-24 border-2 border-primary/30">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>

        <h1 className="mt-4 text-2xl font-bold">{profile.full_name}</h1>
        {profile.headline && (
          <p className="mt-1 text-sm text-muted-foreground">{profile.headline}</p>
        )}
        {profile.location && (
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {profile.location}
          </p>
        )}
        {profile.bio && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
        )}

        <div className="mt-8 space-y-3">
          {projects?.map((project) => (
            <a
              key={project.id}
              href={project.live_demo_url ?? project.github_url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium shadow-xs transition-all hover:border-primary active:scale-[0.98]"
            >
              <span>{project.title}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          ))}

          {experiences?.slice(0, 2).map((exp) => (
            <div
              key={exp.id}
              className="rounded-xl border border-border bg-card px-4 py-3 text-left shadow-xs"
            >
              <p className="text-sm font-medium">{exp.position_title}</p>
              <p className="text-xs text-muted-foreground">{exp.company_name}</p>
            </div>
          ))}
        </div>

        {skills && skills.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold">Aptitudini</h2>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {skills.map((skill) => (
                <Badge key={skill.id} variant="secondary">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {educations && educations.length > 0 && (
          <div className="mt-8 text-left">
            <h2 className="text-sm font-semibold text-center">Educație</h2>
            <div className="mt-3 space-y-3">
              {educations.map((edu) => (
                <div
                  key={edu.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-xs"
                >
                  <p className="text-sm font-medium">{edu.institution_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {edu.degree} · {edu.field_of_study}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-12 text-xs text-muted-foreground">
          <Code2 className="mx-auto mb-2 h-4 w-4" />
          Portofoliu EduLink · Moldova
        </footer>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PortfolioPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, headline")
    .eq("qr_code_slug", slug)
    .single();

  return {
    title: profile
      ? `${profile.full_name} | EduLink Portofoliu`
      : "Portofoliu EduLink",
    description: profile?.headline ?? "Portofoliu digital EduLink",
  };
}
