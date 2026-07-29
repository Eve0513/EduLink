"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/database";
import type {
  ContactStepData,
  EducationStepData,
  ExperienceStepData,
  ProjectStepData,
  SkillStepData,
} from "@/lib/validations/onboarding";

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

export async function completeStudentOnboarding(data: {
  contact: ContactStepData;
  educations: EducationStepData[];
  experiences: ExperienceStepData[];
  skills: SkillStepData[];
  projects: ProjectStepData[];
}) {
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
      full_name: data.contact.fullName,
      headline: data.contact.headline,
      bio: data.contact.bio ?? null,
      location: data.contact.location,
      avatar_url: data.contact.avatarUrl ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (profileError) return { error: profileError.message };

  if (data.educations.length > 0) {
    const { error } = await supabase.from("educations").insert(
      data.educations.map((edu) => ({
        profile_id: profileId,
        institution_name: edu.institution_name,
        degree: edu.degree,
        field_of_study: edu.field_of_study,
        start_date: edu.start_date,
        end_date: edu.is_current ? null : edu.end_date ?? null,
        is_current: edu.is_current,
        gpa: edu.gpa ?? null,
      }))
    );
    if (error) return { error: error.message };
  }

  if (data.experiences.length > 0) {
    const { error } = await supabase.from("experiences").insert(
      data.experiences.map((exp) => ({
        profile_id: profileId,
        company_name: exp.company_name,
        position_title: exp.position_title,
        location: exp.location ?? null,
        start_date: exp.start_date,
        end_date: exp.is_current ? null : exp.end_date ?? null,
        is_current: exp.is_current,
        description: exp.description ?? null,
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

  if (data.projects.length > 0) {
    const { error } = await supabase.from("projects").insert(
      data.projects.map((proj) => ({
        profile_id: profileId,
        title: proj.title,
        description: proj.description ?? null,
        github_url: proj.github_url ?? null,
        live_demo_url: proj.live_demo_url ?? null,
        technologies: proj.technologies,
        image_url: proj.image_url ?? null,
      }))
    );
    if (error) return { error: error.message };
  }

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

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Neautentificat" };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Niciun fișier selectat" };

  const ext = file.name.split(".").pop();
  const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) return { error: updateError.message };

  revalidatePath("/dashboard/student/profile");
  return { success: true, url: publicUrl };
}
