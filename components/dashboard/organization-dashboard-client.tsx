"use client";

import { CalendarDays, ExternalLink, FileText, ImagePlus, MapPin, Plus, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { createCompanyJob, createOrganizationEvent, createOrganizationPost, type OrganizationKind } from "@/app/actions/organization-content";
import { formatTimeAgo } from "@/lib/utils";
import { InviteCodeCard } from "@/components/dashboard/invite-code-card";
import { OrganizationHeader } from "@/components/dashboard/organization-header";

type Organization = {
  id: string;
  name: string;
  website: string | null;
  location: string | null;
  sector: string | null;
  inviteCode: string | null;
  description: string | null;
};
type FeedPost = { id: string; content: string; image_url: string | null; created_at: string };
type EventItem = { id: string; title: string | null; description: string | null; location: string | null; start_date: string | null; start_time: string | null; event_type: string; created_at: string };
type ModalKind = "post" | "event" | "job" | null;

const eventLabels: Record<string, string> = {
  academic_lecture: "Prelegere academică", workshop_training: "Workshop", hackathon_contest: "Hackathon", student_project: "Proiect studențesc", career_fair: "Târg de cariere", networking_meetup: "Networking", volunteer_charity: "Voluntariat", webinar_online: "Webinar", sports_recreation: "Sport și recreere", other: "Alt tip",
};

function formattedDate(value: string | null) {
  if (!value) return "Data urmează";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

export function OrganizationDashboardClient({
  kind,
  organization,
  followerCount,
  posts,
  events,
}: {
  kind: OrganizationKind;
  organization: Organization;
  followerCount: number;
  posts: FeedPost[];
  events: EventItem[];
}) {
  const [tab, setTab] = useState<"home" | "about" | "announcements">("home");
  const [modal, setModal] = useState<ModalKind>(null);
  const [submitting, setSubmitting] = useState(false);
  const entityLabel = kind === "company" ? "companie" : "instituție";
  const organizationType = kind === "company" ? organization.sector || "Companie" : "Instituție de învățământ";

  async function publishPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    const result = await createOrganizationPost({ content: String(form.get("content") ?? "") });
    setSubmitting(false);
    if ("error" in result) return toast.error(result.error);
    toast.success("Anunțul a fost publicat.");
    setModal(null);
  }

  async function publishEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    const result = await createOrganizationEvent({
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      location: String(form.get("location") ?? ""),
      startDate: String(form.get("startDate") ?? ""),
      startTime: String(form.get("startTime") ?? "") || undefined,
      mode: String(form.get("mode") ?? "fizic") as "fizic" | "virtual",
      frequency: String(form.get("frequency") ?? "niciodata") as "niciodata" | "zilnic" | "saptamanal",
      eventType: String(form.get("eventType") ?? "student_project") as "academic_lecture" | "workshop_training" | "hackathon_contest" | "student_project" | "career_fair" | "networking_meetup" | "volunteer_charity" | "webinar_online" | "sports_recreation" | "other",
    });
    setSubmitting(false);
    if ("error" in result) return toast.error(result.error);
    toast.success("Evenimentul a fost publicat.");
    setModal(null);
  }

  async function publishJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    const result = await createCompanyJob({
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      requirements: String(form.get("requirements") ?? ""),
      location: String(form.get("location") ?? ""),
      workMode: String(form.get("workMode") ?? "onsite") as "onsite" | "hybrid" | "remote",
      jobType: String(form.get("jobType") ?? "fulltime") as "fulltime" | "parttime" | "contract" | "volunteer" | "temporary" | "internship" | "other",
      deadline: String(form.get("deadline") ?? "") || undefined,
    });
    setSubmitting(false);
    if ("error" in result) return toast.error(result.error);
    toast.success("Jobul a fost publicat și este vizibil în pagina Joburi.");
    setModal(null);
  }

  const timeline = <div className="space-y-4">
    {posts.map((post) => <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-[#e5f4f6] text-sm font-extrabold text-[#0e5e6f]">{organization.name.slice(0, 2).toUpperCase()}</div><div><p className="font-bold text-slate-950">{organization.name}</p><p className="text-xs text-slate-500">{organizationType} · {formatTimeAgo(post.created_at)}</p></div></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{post.content}</p>{post.image_url ? <img src={post.image_url} alt="Imaginea anunțului" className="mt-4 max-h-[440px] w-full rounded-xl object-cover" /> : null}</article>)}
    {events.map((event) => <article key={event.id} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm"><div className="flex gap-3"><CalendarDays className="mt-0.5 h-6 w-6 text-[#168a9b]" /><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-[#168a9b]">{eventLabels[event.event_type] ?? "Eveniment"}</p><h3 className="mt-1 font-extrabold text-slate-950">{event.title || "Eveniment EduLink"}</h3><p className="mt-1 text-sm text-slate-600">{formattedDate(event.start_date)}{event.start_time ? ` · ${event.start_time.slice(0, 5)}` : ""}{event.location ? ` · ${event.location}` : ""}</p>{event.description ? <p className="mt-3 text-sm leading-6 text-slate-700">{event.description}</p> : null}</div></div></article>)}
    {!posts.length && !events.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm leading-6 text-slate-500">Pagina este pregătită. Publică primul anunț sau eveniment pentru comunitatea ta.</div> : null}
  </div>;

  return <div className="min-h-screen bg-[#f3f6f7]"><OrganizationHeader kind={kind} organizationName={organization.name} /><main className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><div className="min-w-0"><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="h-28 bg-gradient-to-br from-[#003747] via-[#0e5e6f] to-[#168a9b] sm:h-36" /><div className="relative px-5 pb-5"><div className="-mt-10 grid h-20 w-20 place-items-center rounded-xl border-4 border-white bg-[#e5f4f6] text-xl font-extrabold text-[#0e5e6f] shadow-sm">{organization.name.slice(0, 2).toUpperCase()}</div><h1 className="mt-3 text-2xl font-extrabold text-slate-950">{organization.name}</h1><p className="mt-1 text-sm text-slate-600">{organizationType}{organization.location ? ` · ${organization.location}` : ""} · {followerCount.toLocaleString("ro-RO")} urmăritori</p><div className="mt-4 flex flex-wrap gap-2">{organization.website ? <a href={organization.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#026a81] px-4 py-2 text-sm font-bold text-white hover:bg-[#003747]"><ExternalLink className="h-4 w-4" />Vizitează site-ul</a> : null}<button type="button" onClick={() => setModal("post")} className="rounded-lg border border-[#0e5e6f] px-4 py-2 text-sm font-bold text-[#0e5e6f] hover:bg-[#e5f4f6]">Creează un anunț</button></div></div><nav className="flex overflow-x-auto border-t border-slate-200 px-3"><Tab active={tab === "home"} onClick={() => setTab("home")}>Pagina inițială</Tab><Tab active={tab === "about"} onClick={() => setTab("about")}>Despre</Tab><Tab active={tab === "announcements"} onClick={() => setTab("announcements")}>Anunțuri</Tab></nav></section>

  {tab === "about" ? <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-extrabold text-slate-950">Privire de ansamblu</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{organization.description || `${organization.name} este prezentă în comunitatea EduLink. Completează descrierea organizației din setări pentru a oferi vizitatorilor informații complete și actualizate.`}</p><dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2"><Info term="Site web" value={organization.website || "Nu a fost adăugat încă"} /><Info term="Sediu" value={organization.location || "Nu a fost adăugat încă"} /><Info term="Sector" value={organizationType} /><Info term="Urmăritori" value={`${followerCount.toLocaleString("ro-RO")}`} /></dl></section> : <section className="mt-5 space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#e5f4f6] font-bold text-[#0e5e6f]">{organization.name.slice(0, 1)}</div><button type="button" onClick={() => setModal("post")} className="flex-1 rounded-full bg-slate-100 px-4 text-left text-sm text-slate-500 hover:bg-slate-200">Începe o postare sau un anunț...</button></div><div className={`mt-3 grid border-t border-slate-100 pt-3 ${kind === "company" ? "grid-cols-3" : "grid-cols-2"}`}><QuickAction icon={<ImagePlus className="h-5 w-5 text-[#168a9b]" />} label="Postare" onClick={() => setModal("post")} /><QuickAction icon={<CalendarDays className="h-5 w-5 text-amber-600" />} label="Eveniment" onClick={() => setModal("event")} />{kind === "company" ? <QuickAction icon={<BriefcaseIcon />} label="Job post" onClick={() => setModal("job")} /> : null}</div></section>{tab === "home" ? <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-extrabold text-slate-950">Despre {organization.name}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{organization.description || "Pagina inițială reunește anunțurile și evenimentele organizației. Detaliile organizației pot fi completate din setări."}</p><button type="button" onClick={() => setTab("about")} className="mt-3 text-sm font-bold text-[#0e5e6f] hover:underline">Afișează toate detaliile →</button></section> : null}{timeline}</section>}</div><aside className="space-y-5"><InviteCodeCard code={organization.inviteCode} entity={entityLabel} kind={kind} /><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-extrabold text-slate-950">Comunitatea ta</h2><p className="mt-2 text-sm leading-6 text-slate-600">Anunțurile tale ajung în feed-ul studenților care urmăresc organizația.</p><div className="mt-4 rounded-xl bg-[#e5f4f6] p-4"><p className="text-2xl font-extrabold text-[#0e5e6f]">{followerCount.toLocaleString("ro-RO")}</p><p className="text-sm text-slate-600">urmăritori</p></div></section></aside></div></main>{modal ? <Modal onClose={() => !submitting && setModal(null)}>{modal === "post" ? <PostForm onSubmit={publishPost} submitting={submitting} /> : null}{modal === "event" ? <EventForm onSubmit={publishEvent} submitting={submitting} /> : null}{modal === "job" && kind === "company" ? <JobForm onSubmit={publishJob} submitting={submitting} /> : null}</Modal> : null}</div>;
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) { return <button type="button" onClick={onClick} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold ${active ? "border-[#0e5e6f] text-[#0e5e6f]" : "border-transparent text-slate-500 hover:text-[#0e5e6f]"}`}>{children}</button>; }
function Info({ term, value }: { term: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{term}</dt><dd className="mt-1 text-sm text-slate-800">{value}</dd></div>; }
function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">{icon}{label}</button>; }
function BriefcaseIcon() { return <FileText className="h-5 w-5 text-[#0e5e6f]" />; }
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) { return <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/45 p-4"><section className="mx-auto my-6 w-full max-w-2xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-end border-b border-slate-200 px-5 py-3"><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Închide"><X className="h-5 w-5" /></button></div>{children}</section></div>; }
function Input({ label, name, required, type = "text", placeholder }: { label: string; name: string; required?: boolean; type?: string; placeholder?: string }) { return <label className="block text-sm font-bold text-slate-800">{label}{required ? " *" : ""}<input name={name} type={type} required={required} placeholder={placeholder} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#026a81] focus:ring-2 focus:ring-[#026a81]/15" /></label>; }
function PostForm({ onSubmit, submitting }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitting: boolean }) { return <form onSubmit={onSubmit} className="p-6"><h2 className="text-xl font-extrabold text-slate-950">Creează o postare</h2><p className="mt-1 text-sm text-slate-600">Publică un anunț pentru comunitatea EduLink.</p><textarea name="content" required maxLength={3000} placeholder="La ce vrei să informezi comunitatea?" className="mt-5 min-h-40 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-[#026a81] focus:ring-2 focus:ring-[#026a81]/15" /><button disabled={submitting} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#026a81] px-4 py-3 font-bold text-white hover:bg-[#003747] disabled:opacity-60"><Send className="h-4 w-4" />{submitting ? "Se publică..." : "Publică anunțul"}</button></form>; }
function EventForm({ onSubmit, submitting }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitting: boolean }) { return <form onSubmit={onSubmit} className="space-y-4 p-6"><div><h2 className="text-xl font-extrabold text-slate-950">Creează un eveniment</h2><p className="mt-1 text-sm text-slate-600">Completează datele esențiale. Comunitatea va vedea imediat publicarea.</p></div><Input label="Titlu eveniment" name="title" required placeholder="Ex.: Workshop Next.js" /><div className="grid gap-4 sm:grid-cols-2"><Input label="Data de început" name="startDate" required type="date" /><Input label="Ora de început" name="startTime" type="time" /></div><Input label="Locație" name="location" placeholder="Chișinău sau link virtual" /><div className="grid gap-4 sm:grid-cols-3"><Select label="Mod" name="mode" options={[["fizic", "Fizic"], ["virtual", "Virtual"]]} /><Select label="Tip" name="eventType" options={Object.entries(eventLabels)} /><Select label="Repetare" name="frequency" options={[["niciodata", "Nu se repetă"], ["zilnic", "Zilnic"], ["saptamanal", "Săptămânal"]]} /></div><label className="block text-sm font-bold text-slate-800">Detalii<textarea name="description" maxLength={5000} className="mt-1.5 min-h-28 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-[#026a81]" /></label><button disabled={submitting} className="w-full rounded-lg bg-[#026a81] px-4 py-3 font-bold text-white hover:bg-[#003747] disabled:opacity-60">{submitting ? "Se publică..." : "Creează evenimentul"}</button></form>; }
function JobForm({ onSubmit, submitting }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; submitting: boolean }) { return <form id="job-post" onSubmit={onSubmit} className="space-y-4 p-6"><div><h2 className="text-xl font-extrabold text-slate-950">Publică un job</h2><p className="mt-1 text-sm text-slate-600">Doar administratorii companiei pot publica oportunități.</p></div><Input label="Titlu job" name="title" required placeholder="Ex.: Junior Frontend Developer" /><div className="grid gap-4 sm:grid-cols-2"><Input label="Locație" name="location" placeholder="Chișinău" /><Input label="Termen de aplicare" name="deadline" type="date" /></div><div className="grid gap-4 sm:grid-cols-2"><Select label="Mod de lucru" name="workMode" options={[["onsite", "La sediu"], ["hybrid", "Hibrid"], ["remote", "Remote"]]} /><Select label="Tip contract" name="jobType" options={[["fulltime", "Full-time"], ["parttime", "Part-time"], ["internship", "Internship"], ["contract", "Contract"], ["volunteer", "Voluntariat"], ["temporary", "Temporar"], ["other", "Altul"]]} /></div><label className="block text-sm font-bold text-slate-800">Descriere *<textarea name="description" required minLength={30} maxLength={10000} className="mt-1.5 min-h-36 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-[#026a81]" placeholder="Responsabilități, contextul rolului și informații utile pentru candidat." /></label><label className="block text-sm font-bold text-slate-800">Cerințe<textarea name="requirements" maxLength={5000} className="mt-1.5 min-h-24 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-[#026a81]" placeholder="Competențe și condiții necesare." /></label><button disabled={submitting} className="w-full rounded-lg bg-[#026a81] px-4 py-3 font-bold text-white hover:bg-[#003747] disabled:opacity-60">{submitting ? "Se publică..." : "Publică jobul"}</button></form>; }
function Select({ label, name, options }: { label: string; name: string; options: Array<[string, string]> }) { return <label className="block text-sm font-bold text-slate-800">{label}<select name={name} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#026a81]">{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>; }
