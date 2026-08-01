"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FollowTargetType = "user" | "company" | "institution";

function validTarget(targetType: string, targetId: string): targetType is FollowTargetType {
  return ["user", "company", "institution"].includes(targetType) && /^[0-9a-f-]{36}$/i.test(targetId);
}

export async function isFollowing(targetType: FollowTargetType, targetId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !validTarget(targetType, targetId)) return false;
  const { data } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("target_type", targetType).eq("target_id", targetId).maybeSingle();
  return Boolean(data);
}

export async function toggleFollow(targetType: FollowTargetType, targetId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Autentifică-te pentru a urmări acest cont." };
  if (!validTarget(targetType, targetId)) return { error: "Ținta de urmărire nu este validă." };
  const { data: current, error: lookupError } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("target_type", targetType).eq("target_id", targetId).maybeSingle();
  if (lookupError) return { error: "Nu am putut verifica urmărirea acum. Încearcă din nou." };
  const mutation = current ? supabase.from("follows").delete().eq("id", current.id) : supabase.from("follows").insert({ follower_id: user.id, target_type: targetType, target_id: targetId });
  const { error } = await mutation;
  if (error) return { error: "Nu am putut actualiza urmărirea acum. Încearcă din nou." };
  revalidatePath("/feed");
  return { following: !current };
}
