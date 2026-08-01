import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { CV_GENERATION_SYSTEM_PROMPT, CV_JSON_SCHEMA, buildCVGenerationUserMessage, type CVGenerationInput } from "@/lib/ai/generate-cv-prompt";

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
  const skillLevel = (value: string | null): "Începător" | "Avansat" | "Expert" => value === "avansat" ? "Avansat" : value === "intermediar" ? "Expert" : "Începător";
  const input: CVGenerationInput = { language: "ro", profile: { full_name: profile.full_name, headline: profile.headline, bio: profile.bio, email: profile.email, phone: null, location: profile.location, portfolio_slug: profile.qr_code_slug }, educations: (educations ?? []).map((education) => ({ degree_level: education.degree, field_of_study: education.field_of_study, institution_name: education.institution_name, start_date: education.start_date, end_date: education.end_date })), experiences: (experiences ?? []).map((experience) => ({ employment_type: experience.job_type ?? "other", job_title: experience.position_title, organization_name: experience.company_name, location: experience.location, start_date: experience.start_date, end_date: experience.end_date, description: experience.description ?? "" })), projects: (projects ?? []).map((project) => ({ title: project.title, description: project.description ?? "", technologies: project.technologies ?? [], repo_url: project.github_url, live_url: project.live_demo_url })), certificates: (certificates ?? []).map((certificate) => ({ title: certificate.title, issuing_organization: certificate.issuing_organization, date_issued: certificate.issue_date ?? "", credential_id: certificate.credential_url, is_verified: false })), skills: (skills ?? []).map((skill) => ({ name: skill.name, level: skillLevel(skill.level) })) };
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: buildCVGenerationUserMessage(input), config: { systemInstruction: CV_GENERATION_SYSTEM_PROMPT, responseMimeType: "application/json", responseJsonSchema: CV_JSON_SCHEMA } });
    const raw = response.text;
    if (!raw) return NextResponse.json({ error: "CV-ul nu a putut fi generat momentan. Încearcă din nou." }, { status: 502 });
    const generated: unknown = JSON.parse(raw);
    if (!isGeneratedCV(generated)) return NextResponse.json({ error: "CV-ul generat nu a trecut verificarea. Încearcă din nou." }, { status: 502 });
    await supabase.from("ai_generations").insert({ profile_id: profileId, generation_type: "cv_optimization", input_prompt: buildCVGenerationUserMessage(input), generated_content: generated, ats_score: generated.ats_report.score });
    return NextResponse.json({ success: true, ats_score: generated.ats_report.score, cv: generated });
  } catch (error) {
    console.error("CV generation failed", error);
    return NextResponse.json({ error: "CV-ul nu a putut fi generat momentan. Verifică profilul și încearcă din nou." }, { status: 502 });
  }
}

type GeneratedCV = { ats_report: { score: number } };
function isGeneratedCV(value: unknown): value is GeneratedCV { if (!value || typeof value !== "object" || !("ats_report" in value)) return false; const report = value.ats_report; return Boolean(report && typeof report === "object" && "score" in report && typeof report.score === "number"); }
