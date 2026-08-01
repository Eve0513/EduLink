import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { CV_GENERATION_SYSTEM_PROMPT, GeneratedCVSchema, buildCVGenerationUserMessage, buildFallbackCV, type CVGenerationInput } from "@/lib/ai/generate-cv-prompt";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sesiunea a expirat. Autentifică-te din nou." }, { status: 401 });
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "Generarea CV nu este disponibilă momentan." }, { status: 503 });

  const profileId = user.id;
  const [{ data: profile }, { data: educations }, { data: experiences }, { data: projects }, { data: certificates }, { data: skills }] = await Promise.all([
    supabase.from("profiles").select("full_name,headline,bio,email,location,qr_code_slug").eq("id", profileId).single(),
    supabase.from("educations").select("degree,field_of_study,institution_name,start_date,end_date").eq("profile_id", profileId),
    supabase.from("experiences").select("job_type,position_title,company_name,location,start_date,end_date,description").eq("profile_id", profileId),
    supabase.from("projects").select("title,description,technologies,github_url,live_demo_url").eq("profile_id", profileId),
    supabase.from("certificates").select("title,issuing_organization,issue_date,credential_url").eq("profile_id", profileId),
    supabase.from("skills").select("name,level").eq("profile_id", profileId),
  ]);
  if (!profile) return NextResponse.json({ error: "Profilul nu este disponibil. Încearcă din nou." }, { status: 404 });

  const skillLevel = (value: string | null): "Începător" | "Intermediar" | "Avansat" => value === "avansat" ? "Avansat" : value === "intermediar" ? "Intermediar" : "Începător";
  const input: CVGenerationInput = {
    language: "ro",
    profile: { full_name: profile.full_name, headline: profile.headline, bio: profile.bio, email: profile.email, phone: null, location: profile.location, portfolio_slug: profile.qr_code_slug },
    educations: (educations ?? []).map((item) => ({ degree_level: item.degree, field_of_study: item.field_of_study, institution_name: item.institution_name, start_date: item.start_date, end_date: item.end_date })),
    experiences: (experiences ?? []).map((item) => ({ employment_type: item.job_type ?? "other", job_title: item.position_title, organization_name: item.company_name, location: item.location, start_date: item.start_date, end_date: item.end_date, description: item.description ?? "" })),
    projects: (projects ?? []).map((item) => ({ title: item.title, description: item.description ?? "", technologies: item.technologies ?? [], repo_url: item.github_url, live_url: item.live_demo_url })),
    certificates: (certificates ?? []).map((item) => ({ title: item.title, issuing_organization: item.issuing_organization, date_issued: item.issue_date ?? "", credential_id: item.credential_url, is_verified: false })),
    skills: (skills ?? []).map((item) => ({ name: item.name, level: skillLevel(item.level) })),
  };

  let generated = buildFallbackCV(input);
  let usedFallback = true;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // The previous `gemini-2.5-flash` ID is rejected for newly-created API
    // projects. The current Flash alias is verified with this API key and can
    // be overridden safely through GEMINI_CV_MODEL when needed.
    const model = process.env.GEMINI_CV_MODEL?.trim() || "gemini-flash-latest";
    const response = await ai.models.generateContent({ model, contents: buildCVGenerationUserMessage(input), config: { systemInstruction: CV_GENERATION_SYSTEM_PROMPT, responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 8192 } });
    const raw = response.text;
    if (raw) {
      const parsed = GeneratedCVSchema.safeParse(JSON.parse(raw));
      if (parsed.success) { generated = parsed.data; usedFallback = false; }
      else console.error("Gemini returned an invalid CV schema; using fact-based fallback", parsed.error.flatten());
    }
  } catch (error) {
    // A provider failure must not stop a student from downloading a truthful
    // document. The fallback only formats confirmed profile data.
    console.error("CV generation failed; using fact-based fallback", error);
  }

  const { error: auditError } = await supabase.from("ai_generations").insert({ profile_id: profileId, generation_type: "cv_optimization", input_prompt: buildCVGenerationUserMessage(input), generated_content: generated, ats_score: generated.ats_report.score });
  if (auditError) console.error("CV generation audit failed", auditError);
  return NextResponse.json({ success: true, ats_score: generated.ats_report.score, cv: generated, fallback: usedFallback });
}
