"use client";

import Link from "next/link";
import { ExternalLink, Eye, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveStudentProfileBasics } from "@/app/actions/onboarding";
import { StudentHeader } from "@/components/dashboard/student-header";

type PortfolioProfile = {
  full_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  qr_code_slug: string;
};

export function PortfolioEditorClient({ profile }: { profile: PortfolioProfile }) {
  const [draft, setDraft] = useState({
    fullName: profile.full_name,
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
    location: profile.location ?? "",
  });
  const [previewKey, setPreviewKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const publicUrl = `/portofoliu/${profile.qr_code_slug}`;

  function save() {
    startTransition(async () => {
      const result = await saveStudentProfileBasics(draft);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setPreviewKey((key) => key + 1);
      toast.success("Portofoliul public a fost actualizat și previzualizarea a fost reîncărcată.");
    });
  }

  return (
    <main className="min-h-screen bg-[#f5f8f9]">
      <StudentHeader name={profile.full_name} avatarUrl={profile.avatar_url} current="profile" />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0e5e6f]">CMS portofoliu</p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-950">Editează portofoliul</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Informațiile salvate aici apar la adresa ta publică. Proiectele, studiile și atestările se gestionează din profil.</p>
          <div className="mt-6 space-y-4">
            <Field label="Nume public" value={draft.fullName} onChange={(fullName) => setDraft({ ...draft, fullName })} />
            <Field label="Titlu public" value={draft.headline} onChange={(headline) => setDraft({ ...draft, headline })} />
            <Field label="Locație" value={draft.location} onChange={(location) => setDraft({ ...draft, location })} />
            <label className="block text-sm font-bold text-slate-800">Descriere<textarea value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} className={`${inputClass} min-h-32`} /></label>
          </div>
          <button type="button" disabled={pending} onClick={save} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#026a81] px-4 py-3 font-bold text-white transition hover:bg-[#003747] disabled:opacity-70"><Save className="h-4 w-4" />{pending ? "Se salvează..." : "Salvează modificările"}</button>
          <Link href="/dashboard/student/profile" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#0e5e6f] px-4 py-3 text-sm font-bold text-[#0e5e6f] hover:bg-[#e5f4f6]">Gestionează secțiunile profilului</Link>
        </section>
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-xl font-extrabold text-slate-950">Previzualizare live</h2><p className="text-sm text-slate-600">{publicUrl}</p></div>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[#0e5e6f] bg-white px-4 py-2 text-sm font-bold text-[#0e5e6f]"><ExternalLink className="h-4 w-4" />Deschide public</a>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <iframe key={previewKey} title="Previzualizare portofoliu" src={publicUrl} className="h-[760px] w-full rounded-xl bg-white" />
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-500"><Eye className="h-3.5 w-3.5" />Previzualizarea se actualizează automat după salvare.</div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-sm font-bold text-slate-800">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} /></label>;
}

const inputClass = "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-[#026a81] focus:ring-4 focus:ring-[#026a81]/10";
