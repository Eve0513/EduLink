"use client";

import { CalendarDays, ImagePlus, LoaderCircle, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { createStudentEvent, createStudentPost } from "@/app/actions/feed-content";

type ComposerMode = "post" | "event" | null;

const EVENT_TYPES = [
  ["academic_lecture", "Prelegere academică"],
  ["workshop_training", "Workshop / training"],
  ["hackathon_contest", "Hackathon / concurs"],
  ["student_project", "Proiect studențesc"],
  ["career_fair", "Târg de cariere"],
  ["networking_meetup", "Networking"],
  ["volunteer_charity", "Voluntariat"],
  ["webinar_online", "Webinar online"],
] as const;
type EventType = (typeof EVENT_TYPES)[number][0];

export function CreatePostCard({ name }: { name: string }) {
  const [mode, setMode] = useState<ComposerMode>(null);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [event, setEvent] = useState({
    title: "", description: "", location: "", startDate: "", startTime: "", mode: "fizic" as "fizic" | "virtual", frequency: "niciodata" as "niciodata" | "zilnic" | "saptamanal", eventType: "student_project" as EventType,
  });

  function close() {
    if (busy) return;
    setMode(null);
  }

  async function submitPost(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setBusy(true);
    const result = await createStudentPost({ content });
    setBusy(false);
    if ("error" in result) return toast.error(result.error);
    setContent("");
    setMode(null);
    toast.success("Postarea a fost publicată în feed.");
  }

  async function submitEvent(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setBusy(true);
    const result = await createStudentEvent(event);
    setBusy(false);
    if ("error" in result) return toast.error(result.error);
    setMode(null);
    setEvent({ title: "", description: "", location: "", startDate: "", startTime: "", mode: "fizic", frequency: "niciodata", eventType: "student_project" });
    toast.success("Evenimentul a fost publicat.");
  }

  return <>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e5f4f6] font-bold text-[#0e5e6f]">{name.slice(0, 1).toUpperCase()}</div>
        <button type="button" onClick={() => setMode("post")} className="flex-1 rounded-full bg-slate-100 px-4 text-left text-sm text-slate-500 transition hover:bg-slate-200">Începe o postare sau un anunț…</button>
      </div>
      <div className="mt-3 grid grid-cols-2 border-t border-slate-100 pt-3">
        <QuickAction icon={<ImagePlus className="text-[#168a9b]" />} label="Postare" onClick={() => setMode("post")} />
        <QuickAction icon={<CalendarDays className="text-amber-600" />} label="Eveniment" onClick={() => setMode("event")} />
      </div>
    </section>
    {mode ? <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/40 p-0 sm:place-items-center sm:p-5" role="dialog" aria-modal="true" aria-label={mode === "post" ? "Creează o postare" : "Creează un eveniment"}>
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div><h2 className="font-bold text-slate-950">{mode === "post" ? "Creează o postare" : "Creează un eveniment"}</h2><p className="mt-0.5 text-xs text-slate-500">Se publică doar după confirmare.</p></div>
          <button type="button" onClick={close} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Închide"><X className="h-5 w-5" /></button>
        </div>
        {mode === "post" ? <form onSubmit={submitPost} className="space-y-4 p-5">
          <label className="block text-sm font-semibold text-slate-800">Ce vrei să comunici?
            <textarea value={content} onChange={(item) => setContent(item.target.value)} maxLength={3000} autoFocus placeholder="Scrie un anunț, o întrebare sau o actualizare…" className="mt-2 min-h-40 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-[#0e5e6f] focus:ring-2 focus:ring-[#168a9b]/20" />
          </label>
          <div className="flex items-center justify-between gap-3"><span className="text-xs text-slate-500">{content.length}/3000</span><button disabled={busy || !content.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#0e5e6f] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#064b59]">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Publică</button></div>
        </form> : <form onSubmit={submitEvent} className="space-y-4 p-5">
          <Field label="Titlu eveniment *"><input required value={event.title} onChange={(item) => setEvent({ ...event, title: item.target.value })} placeholder="Ex.: Workshop de orientare în carieră" className="form-input" /></Field>
          <Field label="Descriere (opțional)"><textarea value={event.description} onChange={(item) => setEvent({ ...event, description: item.target.value })} placeholder="Care sunt detaliile evenimentului?" className="form-input min-h-24" /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Data începerii *"><input required type="date" value={event.startDate} onChange={(item) => setEvent({ ...event, startDate: item.target.value })} className="form-input" /></Field><Field label="Ora (opțional)"><input type="time" value={event.startTime} onChange={(item) => setEvent({ ...event, startTime: item.target.value })} className="form-input" /></Field></div>
          <Field label="Locație (opțional)"><input value={event.location} onChange={(item) => setEvent({ ...event, location: item.target.value })} placeholder="Ex.: Chișinău sau link video" className="form-input" /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Format"><select value={event.mode} onChange={(item) => setEvent({ ...event, mode: item.target.value as "fizic" | "virtual" })} className="form-input"><option value="fizic">Fizic</option><option value="virtual">Virtual</option></select></Field><Field label="Frecvență"><select value={event.frequency} onChange={(item) => setEvent({ ...event, frequency: item.target.value as "niciodata" | "zilnic" | "saptamanal" })} className="form-input"><option value="niciodata">O singură dată</option><option value="zilnic">Zilnic</option><option value="saptamanal">Săptămânal</option></select></Field></div>
          <Field label="Tip eveniment"><select value={event.eventType} onChange={(item) => setEvent({ ...event, eventType: item.target.value as EventType })} className="form-input">{EVENT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          <div className="flex justify-end"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#0e5e6f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 hover:bg-[#064b59]">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}Publică evenimentul</button></div>
        </form>}
      </div>
    </div> : null}
  </>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-semibold text-slate-800">{label}<span className="mt-1.5 block [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-slate-300 [&>input]:bg-white [&>input]:px-3 [&>input]:py-2.5 [&>input]:text-slate-900 [&>select]:w-full [&>select]:rounded-xl [&>select]:border [&>select]:border-slate-300 [&>select]:bg-white [&>select]:px-3 [&>select]:py-2.5 [&>select]:text-slate-900 [&>textarea]:w-full [&>textarea]:rounded-xl [&>textarea]:border [&>textarea]:border-slate-300 [&>textarea]:bg-white [&>textarea]:p-3 [&>textarea]:text-slate-900">{children}</span></label>; }
function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">{icon}{label}</button>; }
