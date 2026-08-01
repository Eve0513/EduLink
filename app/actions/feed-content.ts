"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

const postSchema = z.object({
  content: z.string().trim().min(1, "Scrie mesajul pe care vrei să îl publici.").max(3_000),
});

const eventSchema = z.object({
  title: z.string().trim().min(3, "Titlul evenimentului trebuie să aibă cel puțin 3 caractere.").max(180),
  description: z.string().trim().max(5_000),
  location: z.string().trim().max(240),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Alege data de început."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  mode: z.enum(["fizic", "virtual"]),
  frequency: z.enum(["niciodata", "zilnic", "saptamanal"]),
  eventType: z.enum([
    "academic_lecture",
    "workshop_training",
    "hackathon_contest",
    "student_project",
    "career_fair",
    "networking_meetup",
    "volunteer_charity",
    "webinar_online",
    "sports_recreation",
    "other",
  ]),
});

async function currentStudent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return { supabase, user: profile?.role === "student" ? user : null };
}

function refreshFeed() {
  revalidatePath("/feed");
  revalidatePath("/dashboard/student/profile");
}

export async function createStudentPost(input: z.infer<typeof postSchema>): Promise<ActionResult> {
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Verifică mesajul." };

  const { supabase, user } = await currentStudent();
  if (!user) return { error: "Sesiunea a expirat sau nu ai dreptul de a publica." };

  const { error } = await supabase.from("posts").insert({ creator_id: user.id, content: parsed.data.content });
  if (error) return { error: "Postarea nu a putut fi publicată acum. Încearcă din nou." };
  refreshFeed();
  return { success: true };
}

export async function createStudentEvent(input: z.infer<typeof eventSchema>): Promise<ActionResult> {
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Verifică datele evenimentului." };

  const { supabase, user } = await currentStudent();
  if (!user) return { error: "Sesiunea a expirat sau nu ai dreptul de a publica." };

  const { error } = await supabase.from("events").insert({
    creator_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    location: parsed.data.location || null,
    start_date: parsed.data.startDate,
    start_time: parsed.data.startTime || null,
    mode: parsed.data.mode,
    frequency: parsed.data.frequency,
    event_type: parsed.data.eventType,
  });
  if (error) return { error: "Evenimentul nu a putut fi publicat acum. Încearcă din nou." };
  refreshFeed();
  return { success: true };
}
