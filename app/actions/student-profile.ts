"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };
type EducationInput = {
  id?: string;
  institutionName: string;
  degree: "bacalaureat" | "licenta" | "master" | "doctorat" | "bacalaureat_licenta";
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
};
type ExperienceInput = {
  id?: string;
  positionTitle: string;
  companyName: string;
  location: string;
  workMode: "onsite" | "hybrid" | "remote" | null;
  jobType: "fulltime" | "parttime" | "contract" | "volunteer" | "temporary" | "internship" | "other" | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
};
type SkillInput = { id?: string; name: string; level: "incepator" | "intermediar" | "avansat" };
type ProjectInput = { id?: string; title: string; description: string; githubUrl: string; liveDemoUrl: string; technologies: string[]; imageUrl: string };
type CertificateInput = { id?: string; title: string; issuingOrganization: string; issueDate: string | null; expiryDate: string | null; credentialUrl: string };
type RecommendationInput = { id?: string; recipientName: string; recipientEmail: string; relationship: string; message: string };

function userMessage() {
  return "Nu am putut salva modificările. Încearcă din nou.";
}

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

async function refreshStudentProfile(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("qr_code_slug").eq("id", profileId).maybeSingle();
  revalidatePath("/dashboard/student/profile");
  revalidatePath("/dashboard/student/portfolio");
  revalidatePath("/feed");
  if (data?.qr_code_slug) revalidatePath(`/portofoliu/${data.qr_code_slug}`);
}

export async function saveEducation(input: EducationInput): Promise<ActionResult> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  if (!input.institutionName.trim() || !input.fieldOfStudy.trim() || !input.startDate) return { error: "Completează instituția, specializarea și data începerii." };
  const values = { profile_id: user.id, institution_name: input.institutionName.trim(), degree: input.degree, field_of_study: input.fieldOfStudy.trim(), start_date: input.startDate, end_date: input.isCurrent ? null : input.endDate, is_current: input.isCurrent };
  const query = input.id ? supabase.from("educations").update(values).eq("id", input.id).eq("profile_id", user.id) : supabase.from("educations").insert(values);
  const { error } = await query;
  if (error) return { error: userMessage() };
  await refreshStudentProfile(user.id);
  return { success: true };
}

export async function deleteEducation(id: string): Promise<ActionResult> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  const { error } = await supabase.from("educations").delete().eq("id", id).eq("profile_id", user.id);
  if (error) return { error: userMessage() };
  await refreshStudentProfile(user.id);
  return { success: true };
}

export async function saveExperience(input: ExperienceInput): Promise<ActionResult> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  if (!input.positionTitle.trim() || !input.startDate) return { error: "Completează titlul funcției și data începerii." };
  const values = { profile_id: user.id, position_title: input.positionTitle.trim(), company_name: input.companyName.trim() || "Independent", location: input.location.trim() || null, work_mode: input.workMode, job_type: input.jobType, start_date: input.startDate, end_date: input.isCurrent ? null : input.endDate, is_current: input.isCurrent, description: input.description.trim() || null };
  const query = input.id ? supabase.from("experiences").update(values).eq("id", input.id).eq("profile_id", user.id) : supabase.from("experiences").insert(values);
  const { error } = await query;
  if (error) return { error: userMessage() };
  await refreshStudentProfile(user.id);
  return { success: true };
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  const { error } = await supabase.from("experiences").delete().eq("id", id).eq("profile_id", user.id);
  if (error) return { error: userMessage() };
  await refreshStudentProfile(user.id);
  return { success: true };
}

export async function saveSkill(input: SkillInput): Promise<ActionResult> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  if (!input.name.trim()) return { error: "Alege o competență." };
  const values = { profile_id: user.id, name: input.name.trim(), level: input.level };
  const query = input.id ? supabase.from("skills").update(values).eq("id", input.id).eq("profile_id", user.id) : supabase.from("skills").insert(values);
  const { error } = await query;
  if (error) return { error: userMessage() };
  await refreshStudentProfile(user.id);
  return { success: true };
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  const { error } = await supabase.from("skills").delete().eq("id", id).eq("profile_id", user.id);
  if (error) return { error: userMessage() };
  await refreshStudentProfile(user.id);
  return { success: true };
}

export async function saveProject(input: ProjectInput): Promise<ActionResult> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  if (!input.title.trim()) return { error: "Denumirea proiectului este obligatorie." };
  const values = { profile_id: user.id, title: input.title.trim(), description: input.description.trim() || null, github_url: input.githubUrl.trim() || null, live_demo_url: input.liveDemoUrl.trim() || null, technologies: input.technologies.filter(Boolean), image_url: input.imageUrl.trim() || null };
  const query = input.id ? supabase.from("projects").update(values).eq("id", input.id).eq("profile_id", user.id) : supabase.from("projects").insert(values);
  const { error } = await query;
  if (error) return { error: userMessage() };
  await refreshStudentProfile(user.id);
  return { success: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  const { error } = await supabase.from("projects").delete().eq("id", id).eq("profile_id", user.id);
  if (error) return { error: userMessage() };
  await refreshStudentProfile(user.id);
  return { success: true };
}

export async function saveCertificate(input: CertificateInput): Promise<ActionResult> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  if (!input.title.trim() || !input.issuingOrganization.trim()) return { error: "Completează denumirea și organizația emitentă." };
  const values = { profile_id: user.id, title: input.title.trim(), issuing_organization: input.issuingOrganization.trim(), issue_date: input.issueDate, expiry_date: input.expiryDate, credential_url: input.credentialUrl.trim() || null };
  const query = input.id ? supabase.from("certificates").update(values).eq("id", input.id).eq("profile_id", user.id) : supabase.from("certificates").insert(values);
  const { error } = await query;
  if (error) return { error: userMessage() };
  await refreshStudentProfile(user.id);
  return { success: true };
}

export async function deleteCertificate(id: string): Promise<ActionResult> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  const { error } = await supabase.from("certificates").delete().eq("id", id).eq("profile_id", user.id);
  if (error) return { error: userMessage() };
  await refreshStudentProfile(user.id);
  return { success: true };
}

export async function saveRecommendationRequest(input: RecommendationInput): Promise<ActionResult> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  const recipientName = input.recipientName.trim();
  const recipientEmail = input.recipientEmail.trim().toLowerCase();
  if (!recipientName || !recipientEmail || !recipientEmail.includes("@")) {
    return { error: "Completează numele și e-mailul persoanei de contact." };
  }
  const values = {
    profile_id: user.id,
    recipient_name: recipientName,
    recipient_email: recipientEmail,
    relationship: input.relationship.trim() || null,
    message: input.message.trim() || null,
  };
  const query = input.id
    ? supabase.from("recommendation_requests").update(values).eq("id", input.id).eq("profile_id", user.id)
    : supabase.from("recommendation_requests").insert(values);
  const { error } = await query;
  if (error) return { error: userMessage() };
  await refreshStudentProfile(user.id);
  return { success: true };
}

export async function deleteRecommendationRequest(id: string): Promise<ActionResult> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  const { error } = await supabase.from("recommendation_requests").delete().eq("id", id).eq("profile_id", user.id);
  if (error) return { error: userMessage() };
  await refreshStudentProfile(user.id);
  return { success: true };
}
