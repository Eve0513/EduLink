"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type OrganizationKind = "company" | "institution";

type ActionResult = { success: true } | { error: string };
type InviteCodeResult = { success: true; code: string } | { error: string };

const postSchema = z.object({ content: z.string().trim().min(1).max(3_000) });
const eventSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().max(5_000).optional(),
  location: z.string().trim().max(240).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  mode: z.enum(["fizic", "virtual"]),
  frequency: z.enum(["niciodata", "zilnic", "saptamanal"]),
  eventType: z.enum(["academic_lecture", "workshop_training", "hackathon_contest", "student_project", "career_fair", "networking_meetup", "volunteer_charity", "webinar_online", "sports_recreation", "other"]),
});
const jobSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(30).max(10_000),
  requirements: z.string().trim().max(5_000).optional(),
  location: z.string().trim().max(240).optional(),
  workMode: z.enum(["onsite", "hybrid", "remote"]),
  jobType: z.enum(["fulltime", "parttime", "contract", "volunteer", "temporary", "internship", "other"]),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

function safeError() {
  return "Acțiunea nu a putut fi finalizată acum. Încearcă din nou.";
}

async function currentOrganization(kind: OrganizationKind) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, organizationId: null };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== kind) return { supabase, user: null, organizationId: null };

  if (kind === "company") {
    const { data: member } = await supabase.from("company_members").select("company_id, role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (member?.company_id) return { supabase, user, organizationId: member.company_id };
    const { data: organization } = await supabase.from("companies").select("id").eq("created_by", user.id).maybeSingle();
    return { supabase, user, organizationId: organization?.id ?? null };
  }

  const { data: member } = await supabase.from("institution_members").select("institution_id, role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
  if (member?.institution_id) return { supabase, user, organizationId: member.institution_id };
  const { data: organization } = await supabase.from("institutions").select("id").eq("created_by", user.id).maybeSingle();
  return { supabase, user, organizationId: organization?.id ?? null };
}

export async function createOrganizationPost(input: z.infer<typeof postSchema>): Promise<ActionResult> {
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { error: "Scrie un mesaj de cel puțin un caracter." };
  const { supabase, user } = await currentOrganization("company");
  const institutionContext = user ? null : await currentOrganization("institution");
  const active = institutionContext ?? { supabase, user };
  if (!active.user) return { error: "Sesiunea a expirat sau nu ai drepturi de publicare." };
  const { error } = await active.supabase.from("posts").insert({ creator_id: active.user.id, content: parsed.data.content });
  if (error) return { error: safeError() };
  revalidatePath("/dashboard/company");
  revalidatePath("/dashboard/institution");
  revalidatePath("/feed");
  return { success: true };
}

export async function createOrganizationEvent(input: z.infer<typeof eventSchema>): Promise<ActionResult> {
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { error: "Completează titlul, data și modul evenimentului." };
  const companyContext = await currentOrganization("company");
  const active = companyContext.user ? companyContext : await currentOrganization("institution");
  if (!active.user) return { error: "Sesiunea a expirat sau nu ai drepturi de publicare." };
  const { error } = await active.supabase.from("events").insert({
    creator_id: active.user.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    location: parsed.data.location || null,
    start_date: parsed.data.startDate,
    start_time: parsed.data.startTime || null,
    mode: parsed.data.mode,
    frequency: parsed.data.frequency,
    event_type: parsed.data.eventType,
  });
  if (error) return { error: safeError() };
  revalidatePath("/dashboard/company");
  revalidatePath("/dashboard/institution");
  revalidatePath("/feed");
  return { success: true };
}

export async function createCompanyJob(input: z.infer<typeof jobSchema>): Promise<ActionResult> {
  const parsed = jobSchema.safeParse(input);
  if (!parsed.success) return { error: "Completează titlul, descrierea și tipul oportunității." };
  const { supabase, user, organizationId } = await currentOrganization("company");
  if (!user || !organizationId) return { error: "Doar administratorii companiei pot publica joburi." };
  const { error } = await supabase.from("jobs").insert({
    company_id: organizationId,
    title: parsed.data.title,
    description: parsed.data.description,
    requirements: parsed.data.requirements || null,
    location: parsed.data.location || null,
    work_mode: parsed.data.workMode,
    job_type: parsed.data.jobType,
    application_deadline: parsed.data.deadline || null,
  });
  if (error) return { error: safeError() };
  revalidatePath("/dashboard/company");
  revalidatePath("/marketplace");
  return { success: true };
}

export async function regenerateOrganizationInviteCode(kind: OrganizationKind): Promise<InviteCodeResult> {
  const { supabase, user } = await currentOrganization(kind);
  if (!user) return { error: "Nu ai permisiunea să regenerezi codul." };
  const functionName = kind === "company" ? "regenerate_company_invite_code" : "regenerate_institution_invite_code";
  const { data, error } = await supabase.rpc(functionName);
  if (error || typeof data !== "string") return { error: safeError() };
  revalidatePath(kind === "company" ? "/dashboard/company" : "/dashboard/institution");
  revalidatePath(kind === "company" ? "/dashboard/company/settings" : "/dashboard/institution/settings");
  return { success: true, code: data };
}
