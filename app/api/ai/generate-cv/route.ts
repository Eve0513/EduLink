import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import {
  CV_GENERATION_SYSTEM_PROMPT,
  CV_JSON_SCHEMA,
  buildCVGenerationUserMessage,
  type CVGenerationInput,
} from "@/lib/ai/generate-cv-prompt";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY nu este configurată" },
      { status: 500 }
    );
  }

  const profileId = user.id;

  const [
    { data: profile },
    { data: educations },
    { data: experiences },
    { data: projects },
    { data: certificates },
    { data: skills },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", profileId).single(),
    supabase.from("educations").select("*").eq("profile_id", profileId),
    supabase.from("experiences").select("*").eq("profile_id", profileId),
    supabase.from("projects").select("*").eq("profile_id", profileId),
    supabase.from("certificates").select("*").eq("profile_id", profileId),
    supabase.from("skills").select("*").eq("profile_id", profileId),
  ]);

  if (!profile) {
    return NextResponse.json({ error: "Profil negăsit" }, { status: 404 });
  }

  const input: CVGenerationInput = {
    language: "ro",
    profile: {
      full_name: profile.full_name,
      headline: profile.headline,
      bio: profile.bio,
      email: profile.email,
      phone: null,
      location: profile.location,
      portfolio_slug: profile.qr_code_slug,
    },
    educations: (educations ?? []).map((e) => ({
      degree_level: e.degree,
      field_of_study: e.field_of_study,
      institution_name: e.institution_name,
      start_date: e.start_date,
      end_date: e.end_date,
      gpa: e.gpa,
    })),
    experiences: (experiences ?? []).map((e) => ({
      employment_type: e.job_type ?? "Full-time",
      job_title: e.position_title,
      organization_name: e.company_name,
      location: e.location,
      start_date: e.start_date,
      end_date: e.end_date,
      description: e.description ?? "",
    })),
    projects: (projects ?? []).map((p) => ({
      title: p.title,
      description: p.description ?? "",
      technologies: p.technologies ?? [],
      repo_url: p.github_url,
      live_url: p.live_demo_url,
    })),
    certificates: (certificates ?? []).map((c) => ({
      title: c.title,
      issuing_organization: c.issuing_organization,
      date_issued: c.issue_date ?? "",
      credential_id: c.credential_url,
      is_verified: false,
    })),
    skills: (skills ?? []).map((s) => ({
      name: s.name,
      level: s.level as "Începător" | "Avansat" | "Expert",
    })),
  };

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: CV_GENERATION_SYSTEM_PROMPT },
        { role: "user", content: buildCVGenerationUserMessage(input) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: CV_JSON_SCHEMA,
      },
    });

    const raw = completion.choices[0].message.content;
    if (!raw) {
      return NextResponse.json(
        { error: "Răspuns gol de la OpenAI" },
        { status: 500 }
      );
    }

    const generated = JSON.parse(raw);
    const atsScore = generated.ats_report?.score ?? null;

    await supabase.from("ai_generations").insert({
      profile_id: profileId,
      generation_type: "cv_optimization",
      input_prompt: buildCVGenerationUserMessage(input),
      generated_content: generated,
      ats_score: atsScore,
    });

    return NextResponse.json({
      success: true,
      ats_score: atsScore,
      cv: generated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eroare OpenAI";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
