"use server";

import { createClient } from "@/lib/supabase/server";

type UploadResult = { success: true; url: string } | { error: string };

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 7 * 1024 * 1024;

export async function uploadFeedImage(formData: FormData): Promise<UploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou înainte de încărcare." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Alege o imagine înainte de publicare." };
  if (!acceptedTypes.has(file.type)) return { error: "Imaginea trebuie să fie JPG, PNG sau WebP." };
  if (file.size > maxImageBytes) return { error: "Imaginea trebuie să fie mai mică de 7 MB." };

  const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
  const path = `${user.id}/feed/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("profile-media").upload(path, file, {
    upsert: false,
    contentType: file.type,
  });

  if (error) return { error: "Imaginea nu a putut fi încărcată acum. Încearcă din nou." };
  const { data } = supabase.storage.from("profile-media").getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}
