"use client";

import { CalendarDays, ImagePlus, LoaderCircle, Send, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createStudentEvent, createStudentPost } from "@/app/actions/feed-content";
import { uploadFeedImage } from "@/app/actions/media";
import { normaliseRomanianDateInput } from "@/lib/romanian-date";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

type ComposerMode = "post" | "event" | null;
type EventType = "academic_lecture" | "workshop_training" | "hackathon_contest" | "student_project" | "career_fair" | "networking_meetup" | "volunteer_charity" | "webinar_online";
type EventDraft = {
  title: string; description: string; location: string; startDate: string; startTime: string;
  mode: "fizic" | "virtual"; frequency: "niciodata" | "zilnic" | "saptamanal"; eventType: EventType;
};

const eventTypes: Array<[EventType, string]> = [
  ["academic_lecture", "Prelegere academică"], ["workshop_training", "Workshop / training"],
  ["hackathon_contest", "Hackathon / concurs"], ["student_project", "Proiect studențesc"],
  ["career_fair", "Târg de cariere"], ["networking_meetup", "Networking"],
  ["volunteer_charity", "Voluntariat"], ["webinar_online", "Webinar online"],
];
const emptyEvent: EventDraft = { title: "", description: "", location: "", startDate: "", startTime: "", mode: "fizic", frequency: "niciodata", eventType: "student_project" };
const fieldClass = "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#026a81] focus:ring-2 focus:ring-[#026a81]/15";

export function CreatePostCard({ name }: { name: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<ComposerMode>(null);
  const [content, setContent] = useState("");
  const [event, setEvent] = useState<EventDraft>(emptyEvent);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reset() { setContent(""); setEvent(emptyEvent); setImage(null); setPreview(null); }
  function close() { if (!busy) { reset(); setMode(null); } }
  function chooseImage(file: File | undefined) {
    if (!file) return;
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type) || file.size > 7 * 1024 * 1024) {
      toast.error("Alege o imagine JPG, PNG sau WebP mai mică de 7 MB.");
      return;
    }
    setImage(file); setPreview(URL.createObjectURL(file));
    toast.success("Imaginea a fost atașată. Poți publica și fără imagine.");
  }
  async function getImageUrl() {
    if (!image) return { url: null } as const;
    const formData = new FormData(); formData.set("file", image);
    return uploadFeedImage(formData);
  }
  async function submitPost(form: FormEvent<HTMLFormElement>) {
    form.preventDefault(); setBusy(true);
    const upload = await getImageUrl();
    if ("error" in upload) { setBusy(false); toast.error(upload.error); return; }
    const result = await createStudentPost({ content, imageUrl: upload.url });
    setBusy(false);
    if ("error" in result) { toast.error(result.error); return; }
    close(); router.refresh(); toast.success("Postarea a fost publicată în feed.");
  }
  async function submitEvent(form: FormEvent<HTMLFormElement>) {
    form.preventDefault(); setBusy(true);
    const upload = await getImageUrl();
    if ("error" in upload) { setBusy(false); toast.error(upload.error); return; }
    const result = await createStudentEvent({ ...event, imageUrl: upload.url });
    setBusy(false);
    if ("error" in result) { toast.error(result.error); return; }
    close(); router.refresh(); toast.success("Evenimentul a fost publicat.");
  }

  return <>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3"><ProfileAvatar src={null} name={name} className="h-10 w-10" /><button type="button" onClick={() => setMode("post")} className="flex-1 rounded-full bg-slate-100 px-4 text-left text-sm text-slate-500 transition hover:bg-slate-200">Începe o postare sau un anunț…</button></div>
      <div className="mt-3 grid grid-cols-2 border-t border-slate-100 pt-3"><QuickAction icon={<ImagePlus className="text-[#168a9b]" />} label="Postare" onClick={() => setMode("post")} /><QuickAction icon={<CalendarDays className="text-amber-600" />} label="Eveniment" onClick={() => setMode("event")} /></div>
    </section>
    {mode ? <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/40 p-0 sm:place-items-center sm:p-5" role="dialog" aria-modal="true" aria-label={mode === "post" ? "Creează o postare" : "Creează un eveniment"}>
      <section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"><header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4"><div><h2 className="font-bold text-slate-950">{mode === "post" ? "Creează o postare" : "Creează un eveniment"}</h2><p className="mt-0.5 text-xs text-slate-500">Imaginea este opțională. Vei primi o confirmare după publicare.</p></div><button type="button" onClick={close} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Închide"><X className="h-5 w-5" /></button></header>
        {mode === "post" ? <form onSubmit={submitPost} className="space-y-4 p-5"><Field label="Ce vrei să comunici?"><textarea autoFocus required maxLength={3_000} value={content} onChange={(item) => setContent(item.target.value)} placeholder="Scrie un anunț, o întrebare sau o actualizare…" className={`${fieldClass} min-h-40`} /></Field><ImageField preview={preview} onChange={chooseImage} /><div className="flex items-center justify-between gap-3"><span className="text-xs text-slate-500">{content.length}/3000</span><Submit busy={busy} disabled={!content.trim()} label="Publică" /></div></form> : <form onSubmit={submitEvent} className="space-y-4 p-5"><Field label="Titlu eveniment *"><input required value={event.title} onChange={(item) => setEvent({ ...event, title: item.target.value })} placeholder="Ex.: Workshop de orientare în carieră" className={fieldClass} /></Field><Field label="Descriere (opțional)"><textarea value={event.description} onChange={(item) => setEvent({ ...event, description: item.target.value })} placeholder="Care sunt detaliile evenimentului?" className={`${fieldClass} min-h-24`} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Data începerii *"><input required inputMode="numeric" placeholder="dd/mm/yyyy" value={event.startDate} onChange={(item) => setEvent({ ...event, startDate: normaliseRomanianDateInput(item.target.value) })} className={fieldClass} /></Field><Field label="Ora (24h, opțional)"><input inputMode="numeric" placeholder="HH:MM" value={event.startTime} onChange={(item) => setEvent({ ...event, startTime: item.target.value.replace(/[^0-9:]/g, "").slice(0, 5) })} className={fieldClass} /></Field></div><Field label="Locație (opțional)"><input value={event.location} onChange={(item) => setEvent({ ...event, location: item.target.value })} placeholder="Ex.: Chișinău sau link video" className={fieldClass} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Format"><select value={event.mode} onChange={(item) => setEvent({ ...event, mode: item.target.value as EventDraft["mode"] })} className={fieldClass}><option value="fizic">Fizic</option><option value="virtual">Virtual</option></select></Field><Field label="Frecvență"><select value={event.frequency} onChange={(item) => setEvent({ ...event, frequency: item.target.value as EventDraft["frequency"] })} className={fieldClass}><option value="niciodata">O singură dată</option><option value="zilnic">Zilnic</option><option value="saptamanal">Săptămânal</option></select></Field></div><Field label="Tip eveniment"><select value={event.eventType} onChange={(item) => setEvent({ ...event, eventType: item.target.value as EventType })} className={fieldClass}>{eventTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><ImageField preview={preview} onChange={chooseImage} /><div className="flex justify-end"><Submit busy={busy} label="Publică evenimentul" /></div></form>}
      </section>
    </div> : null}
  </>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-semibold text-slate-800">{label}{children}</label>; }
function ImageField({ preview, onChange }: { preview: string | null; onChange: (file: File | undefined) => void }) { return <label className="block rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700"><span className="font-bold text-slate-900">Imagine (opțional)</span><span className="mt-1 block text-xs text-slate-500">JPG, PNG sau WebP, maximum 7 MB.</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => onChange(event.target.files?.[0])} className="mt-3 block w-full text-sm" />{preview ? <img src={preview} alt="Previzualizare imagine selectată" className="mt-3 max-h-56 w-full rounded-lg object-cover" /> : null}</label>; }
function Submit({ busy, label, disabled = false }: { busy: boolean; label: string; disabled?: boolean }) { return <button disabled={busy || disabled} className="inline-flex items-center gap-2 rounded-xl bg-[#0e5e6f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#064b59] disabled:cursor-not-allowed disabled:opacity-50">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{label}</button>; }
function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">{icon}{label}</button>; }
