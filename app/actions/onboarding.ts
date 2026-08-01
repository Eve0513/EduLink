"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/database";
type StudentOnboardingPayload = {
  firstName: string; lastName: string; location: string; bio: string; avatarUrl: string | null;
  education: { institution: string; degree: string; field: string; startDate: string; endDate: string; current: boolean };
  desiredJobTitles: string[];
  experiences: { position: string; company: string; location: string; start: string; description: string }[];
  skills: { name: string; level: "incepator" | "intermediar" | "avansat" }[];
};

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

  if (error) return { error: error.message };

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

  if (profileError) return { error: profileError.message };

  {
    const { error } = await supabase.from("educations").insert({ profile_id: profileId, institution_name: data.education.institution, degree: data.education.degree, field_of_study: data.education.field, start_date: data.education.startDate, end_date: data.education.current ? null : data.education.endDate || null, is_current: data.education.current });
    if (error) return { error: error.message };
  }

  if (data.experiences.length > 0) {
    const { error } = await supabase.from("experiences").insert(
      data.experiences.map((exp) => ({
        profile_id: profileId,
        company_name: exp.company || "Independent",
        position_title: exp.position,
        location: exp.location || null,
        start_date: exp.start || new Date().toISOString().slice(0, 10),
        end_date: null,
        is_current: true,
        description: exp.description || null,
      }))
    );
    if (error) return { error: error.message };
  }

  if (data.skills.length > 0) {
    const { error } = await supabase.from("skills").insert(
      data.skills.map((skill) => ({
        profile_id: profileId,
        name: skill.name,
        level: skill.level,
      }))
    );
    if (error) return { error: error.message };
  }

  const { error: preferenceError } = await supabase.from("student_preferences").upsert({ profile_id: profileId, desired_job_titles: data.desiredJobTitles, opportunity_types: [] }, { onConflict: "profile_id" });
  if (preferenceError) return { error: preferenceError.message };

  revalidatePath("/dashboard");
  return { success: true };
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

  if (error) return { error: error.message };

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

  const fullName = data.fullName.trim();
  if (!fullName) return { error: "Numele complet este obligatoriu." };

  const names = fullName.split(/\s+/);
  const { error } = await supabase.from("profiles").update({
    full_name: fullName,
    first_name: names.slice(0, -1).join(" ") || names[0],
    last_name: names.length > 1 ? names[names.length - 1] : null,
    headline: data.headline.trim() || null,
    location: data.location.trim() || null,
    bio: data.bio.trim() || null,
    updated_at: new Date().toISOString(),
  }).eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/student/profile");
  revalidatePath("/feed");
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
  revalidatePath("/feed");
  return { success: true };
}
