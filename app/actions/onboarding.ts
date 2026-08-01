"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/database";
type StudentOnboardingPayload = {
  firstName: string; lastName: string; location: string; bio: string; avatarUrl: string | null;
  education: { institution: string; degree: string; field: string; startDate: string; endDate: string; current: boolean };
  desiredJobTitles: string[];
  experiences: { position: string; company: string; location: string; start: string; description: string }[];
  skills: { name: string; level: "incepator" | "intermediar" | "avansat" }[];
};

const profileBasicsSchema = z.object({
  fullName: z.string().trim().min(1, "Numele complet este obligatoriu.").max(160),
  headline: z.string().trim().max(160),
  location: z.string().trim().max(160),
  bio: z.string().trim().max(2500),
});

const saveError = "Nu am putut salva modificările acum. Încearcă din nou.";

export async function updateUserRole(role: UserRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Neautentificat" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", user.id);

  if (error) return { error: saveError };

  revalidatePath("/onboarding");
  return { success: true };
}

export async function completeStudentOnboarding(data: StudentOnboardingPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Neautentificat" };
  }

  const profileId = user.id;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: `${data.firstName} ${data.lastName}`,
      first_name: data.firstName,
      last_name: data.lastName,
      headline: data.desiredJobTitles[0] ?? "Student",
      bio: data.bio || null,
      location: data.location,
      avatar_url: data.avatarUrl ?? null,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (profileError) return { error: saveError };

  {
    const { error } = await supabase.from("educations").insert({ profile_id: profileId, institution_name: data.education.institution, degree: data.education.degree, field_of_study: data.education.field, start_date: data.education.startDate, end_date: data.education.current ? null : data.education.endDate || null, is_current: data.education.current });
    if (error) return { error: saveError };
  }

  if (data.experiences.length > 0) {
    const { error } = await supabase.from("experiences").insert(
      data.experiences.map((exp) => ({
        profile_id: profileId,
        company_name: exp.company || null,
        position_title: exp.position,
        location: exp.location || null,
        start_date: exp.start || new Date().toISOString().slice(0, 10),
        end_date: null,
        is_current: true,
        description: exp.description || null,
      }))
    );
    if (error) return { error: saveError };
  }

  if (data.skills.length > 0) {
    const { error } = await supabase.from("skills").insert(
      data.skills.map((skill) => ({
        profile_id: profileId,
        name: skill.name,
        level: skill.level,
      }))
    );
    if (error) return { error: saveError };
  }

  const { error: preferenceError } = await supabase.from("student_preferences").upsert({ profile_id: profileId, desired_job_titles: data.desiredJobTitles, opportunity_types: [] }, { onConflict: "profile_id" });
  if (preferenceError) return { error: saveError };

  revalidatePath("/dashboard");
  return { success: true };
}

const organizationBasicsSchema = z.object({
  firstName: z.string().trim().min(1, "Prenumele este obligatoriu.").max(80),
  lastName: z.string().trim().min(1, "Numele este obligatoriu.").max(80),
  jobTitle: z.string().trim().min(2, "Funcția este obligatorie.").max(160),
  mode: z.enum(["create", "join", "request"]),
  organizationName: z.string().trim().max(180),
  inviteCode: z.string().trim().max(32),
  website: z.string().trim().max(500),
  organizationType: z.enum(["liceu", "colegiu", "universitate"]).optional(),
  city: z.string().trim().max(120),
  officialEmail: z.string().trim().max(254),
  companySize: z.string().trim().max(60),
  sector: z.string().trim().max(120),
});

export type OrganizationOnboardingData = z.infer<typeof organizationBasicsSchema>;

async function completeOrganizationOnboarding(
  kind: "company" | "institution",
  data: OrganizationOnboardingData
) {
  const parsed = organizationBasicsSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Verifică datele introduse." };
  const value = parsed.data;
  if (value.mode === "join" && (!value.organizationName || !value.inviteCode)) return { error: "Alege organizația și introdu codul de invitație." };
  if (value.mode === "create" && !value.organizationName) return { error: "Numele organizației este obligatoriu." };
  if (kind === "institution" && value.mode === "request" && (!value.organizationName || !value.city || !value.officialEmail || !value.organizationType)) return { error: "Completează numele, tipul, orașul și e-mailul oficial." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };

  const functionName = kind === "company" ? "complete_company_onboarding" : "complete_institution_onboarding";
  const { data: result, error } = await supabase.rpc(functionName, {
    p_first_name: value.firstName,
    p_last_name: value.lastName,
    p_job_title: value.jobTitle,
    p_mode: value.mode,
    p_organization_name: value.organizationName || null,
    p_invite_code: value.inviteCode || null,
    p_website: value.website || null,
    p_company_size: kind === "company" ? value.companySize || null : null,
    p_sector: kind === "company" ? value.sector || null : null,
    p_institution_type: kind === "institution" ? value.organizationType ?? null : null,
    p_city: kind === "institution" ? value.city || null : null,
    p_official_email: kind === "institution" ? value.officialEmail || null : null,
  });
  if (error || !result || typeof result !== "object") return { error: "Nu am putut finaliza onboarding-ul. Verifică datele sau codul de invitație." };
  const response = result as { invite_code?: string; pending?: boolean };
  revalidatePath("/onboarding");
  revalidatePath(`/dashboard/${kind}`);
  return { success: true, inviteCode: response.invite_code ?? null, pending: response.pending === true };
}

export async function completeCompanyOnboarding(data: OrganizationOnboardingData) {
  return await completeOrganizationOnboarding("company", data);
}

export async function completeInstitutionOnboarding(data: OrganizationOnboardingData) {
  return await completeOrganizationOnboarding("institution", data);
}

export async function updateProfileField(
  field: "full_name" | "headline" | "bio" | "location",
  value: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Neautentificat" };

  const { error } = await supabase
    .from("profiles")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: saveError };

  revalidatePath("/dashboard/student/profile");
  return { success: true, value };
}

export async function saveStudentProfileBasics(data: {
  fullName: string;
  headline: string;
  location: string;
  bio: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };

  const parsed = profileBasicsSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Verifică datele profilului." };
  const fullName = parsed.data.fullName;

  const names = fullName.split(/\s+/);
  const { error } = await supabase.from("profiles").update({
    full_name: fullName,
    first_name: names.slice(0, -1).join(" ") || names[0],
    last_name: names.length > 1 ? names[names.length - 1] : null,
    headline: parsed.data.headline || null,
    location: parsed.data.location || null,
    bio: parsed.data.bio || null,
    updated_at: new Date().toISOString(),
  }).eq("id", user.id);

  if (error) return { error: saveError };
  revalidatePath("/dashboard/student/profile");
  revalidatePath("/dashboard/student/portfolio");
  revalidatePath("/feed");
  const { data: profile } = await supabase.from("profiles").select("qr_code_slug").eq("id", user.id).maybeSingle();
  if (profile?.qr_code_slug) revalidatePath(`/portofoliu/${profile.qr_code_slug}`);
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Neautentificat" };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Niciun fișier selectat" };

  const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!acceptedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
    return { error: "Alege o imagine JPG, PNG sau WebP mai mică de 5 MB." };
  }
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { error: "Imaginea nu a putut fi încărcată acum. Încearcă din nou." };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) return { error: "Imaginea a fost încărcată, dar profilul nu a putut fi actualizat. Încearcă din nou." };

  revalidatePath("/dashboard/student/profile");
  return { success: true, url: publicUrl };
}

export async function removeAvatar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };
  const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
  if (error) return { error: "Fotografia nu a putut fi eliminată acum. Încearcă din nou." };
  revalidatePath("/dashboard/student/profile");
  revalidatePath("/dashboard/student/portfolio");
  revalidatePath("/feed");
  const { data: profile } = await supabase.from("profiles").select("qr_code_slug").eq("id", user.id).maybeSingle();
  if (profile?.qr_code_slug) revalidatePath(`/portofoliu/${profile.qr_code_slug}`);
  return { success: true };
}
