"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function applyToJob(formData: FormData) {
  const jobId = String(formData.get("jobId") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim().slice(0, 1500);
  const cv = formData.get("cv");
  if (!/^[0-9a-f-]{36}$/i.test(jobId)) return { error: "Jobul nu a putut fi identificat." };
  if (!(cv instanceof File) || cv.size === 0) return { error: "Atașează CV-ul în format PDF." };
  if (cv.type !== "application/pdf" || cv.size > 10 * 1024 * 1024) return { error: "CV-ul trebuie să fie PDF și să aibă cel mult 10 MB." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  const { data: profile } = await supabase.from("profiles").select("role,onboarding_completed").eq("id", user.id).maybeSingle();
  if (profile?.role !== "student" || !profile.onboarding_completed) return { error: "Doar studenții cu profil activ pot aplica la joburi." };
  const path = user.id + "/job-applications/" + crypto.randomUUID() + ".pdf";
  const { error: uploadError } = await supabase.storage.from("profile-media").upload(path, cv, { contentType: "application/pdf", upsert: false });
  if (uploadError) return { error: "CV-ul nu a putut fi încărcat acum. Încearcă din nou." };
  const { data: { publicUrl } } = supabase.storage.from("profile-media").getPublicUrl(path);
  const { error } = await supabase.from("job_applications").upsert({ job_id: jobId, student_id: user.id, cv_url: publicUrl, message: message || null, updated_at: new Date().toISOString() }, { onConflict: "job_id,student_id" });
  if (error) return { error: "Aplicarea nu a putut fi salvată acum. Încearcă din nou." };
  revalidatePath("/marketplace");
  return { success: true };
}
export type JobApplicationStatus = "submitted" | "reviewing" | "accepted" | "rejected";

export async function updateJobApplicationStatus(applicationId: string, status: JobApplicationStatus) {
  if (!/^[0-9a-f-]{36}$/i.test(applicationId)) return { error: "Aplicația nu a putut fi identificată." };
  if (!["submitted", "reviewing", "accepted", "rejected"].includes(status)) return { error: "Statusul aplicației nu este valid." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  const { data: profile } = await supabase.from("profiles").select("role,onboarding_completed").eq("id", user.id).maybeSingle();
  if (profile?.role !== "company" || !profile.onboarding_completed) return { error: "Doar o companie activă poate actualiza aplicațiile." };
  const { data: application } = await supabase.from("job_applications").select("id,job_id").eq("id", applicationId).maybeSingle();
  if (!application) return { error: "Aplicația nu mai este disponibilă." };
  const { data: job } = await supabase.from("jobs").select("company_id").eq("id", application.job_id).maybeSingle();
  if (job?.company_id !== user.id) return { error: "Nu ai acces la această aplicație." };
  const { error } = await supabase.from("job_applications").update({ status, updated_at: new Date().toISOString() }).eq("id", applicationId);
  if (error) return { error: "Statusul nu a putut fi salvat. Încearcă din nou." };
  revalidatePath("/dashboard/company/jobs");
  revalidatePath("/marketplace");
  return { success: true };
}
