"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { ExternalLink, FileDown, Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { StudentHeader } from "@/components/dashboard/student-header";
import { CVPdfDocument } from "@/components/dashboard/cv-pdf-document";
import type { GeneratedCV } from "@/lib/ai/generate-cv-prompt";

type GenerationResponse =
  | { success: true; ats_score: number; cv: GeneratedCV }
  | { success?: false; error?: string };

type Intent = "cv" | "portfolio" | null;

export function AIHubClient({
  portfolioSlug,
  name,
  avatarUrl,
}: {
  portfolioSlug: string | null;
  name: string;
  avatarUrl: string | null;
}) {
  const params = useSearchParams();
  const [generating, setGenerating] = useState(false);
  const [generatedCV, setGeneratedCV] = useState<GeneratedCV | null>(null);
  const [intent, setIntent] = useState<Intent>(null);

  useEffect(() => {
    const value = params.get("intent");
    if (value === "cv" || value === "portfolio") setIntent(value);
  }, [params]);

  async function handleGenerateCV() {
    setIntent(null);
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-cv", { method: "POST" });
      const data: GenerationResponse = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        toast.error("CV-ul nu a putut fi generat acum. Verifică profilul și încearcă din nou.");
        return;
      }

      setGeneratedCV(data.cv);
      toast.success(`CV-ul este gata. Scor ATS: ${Math.round(data.ats_score)}%.`);
    } catch {
      toast.error("Conexiunea a fost întreruptă. Încearcă din nou.");
    } finally {
      setGenerating(false);
    }
  }

  async function publishPortfolio() {
    setIntent(null);
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-website", { method: "POST" });
      const data: { success?: boolean; public_path?: string } = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.public_path) {
        toast.error("Portofoliul nu a putut fi publicat acum. Verifică profilul și încearcă din nou.");
        return;
      }
      toast.success("Portofoliul tău public este pregătit.");
      window.open(data.public_path, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Conexiunea a fost întreruptă. Încearcă din nou.");
    } finally {
      setGenerating(false);
    }
  }

  function continueIntent() {
    if (intent === "cv") {
      void handleGenerateCV();
      return;
    }

    if (!portfolioSlug) {
      setIntent(null);
      toast.info("Completează profilul pentru a primi adresa portofoliului.");
      return;
    }
    void publishPortfolio();
  }

  const downloadFilename = `CV-${name.trim().replace(/\s+/g, "-") || "EduLink"}.pdf`;

  return (
    <div className="min-h-screen bg-[#f5f8f9]">
      <StudentHeader name={name} avatarUrl={avatarUrl} current="ai" />
      <main className="mx-auto max-w-4xl space-y-8 px-5 py-8 sm:px-6">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0e5e6f]">Spațiul tău AI</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950">AI Hub</h1>
          <p className="mt-2 text-slate-600">Generează un CV ATS și publică portofoliul digital din datele confirmate în profil.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950"><Sparkles className="h-5 w-5 text-[#026a81]" />Generează CV</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">AI-ul folosește exclusiv informațiile completate în profil și nu inventează experiențe, rezultate sau certificări.</p>
            <button type="button" onClick={() => setIntent("cv")} disabled={generating} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#026a81] px-4 py-3 font-bold text-white transition hover:bg-[#003747] disabled:cursor-not-allowed disabled:opacity-70">
              {generating ? <><Loader2 className="h-4 w-4 animate-spin" />Se generează CV-ul...</> : <><Sparkles className="h-4 w-4" />Generează CV cu AI</>}
            </button>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950"><ExternalLink className="h-5 w-5 text-[#026a81]" />Portofoliu public</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">Portofoliul tău folosește un template EduLink sigur și își actualizează datele direct din profil.</p>
            <button type="button" onClick={() => setIntent("portfolio")} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#0e5e6f] px-4 py-3 font-bold text-[#0e5e6f] transition hover:bg-[#e5f4f6]">
              <ExternalLink className="h-4 w-4" />Generează portofoliu
            </button>
          </section>
        </div>

        {generatedCV ? (
          <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">CV pregătit</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-950">{generatedCV.contact.full_name}</h2>
                <p className="mt-1 text-sm text-slate-600">Rol țintă: {generatedCV.target_role_inferred}. Scor ATS: {Math.round(generatedCV.ats_report.score)} / 100.</p>
              </div>
              <PDFDownloadLink document={<CVPdfDocument cv={generatedCV} />} fileName={downloadFilename} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0e5e6f] px-4 py-3 text-sm font-bold text-white hover:bg-[#003747]">
                {({ loading }) => loading ? <><Loader2 className="h-4 w-4 animate-spin" />Se pregătește PDF-ul...</> : <><FileDown className="h-4 w-4" />Descarcă PDF</>}
              </PDFDownloadLink>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-5">
              <h3 className="font-bold text-slate-900">Sugestii pentru profil</h3>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                {generatedCV.ats_report.improvement_suggestions.map((suggestion) => <li key={suggestion} className="flex gap-2"><span className="font-bold text-[#0e5e6f]">•</span>{suggestion}</li>)}
              </ul>
            </div>
          </section>
        ) : null}
      </main>

      {intent ? (
        <div role="dialog" aria-modal="true" aria-labelledby="generation-title" className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4">
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="generation-title" className="text-xl font-extrabold text-slate-950">Înainte de generare</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">Asigură-te că ai tot profilul completat înainte de a crea cu AI. Nu vor fi procesate informațiile care lipsesc.</p>
              </div>
              <button type="button" onClick={() => setIntent(null)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="Închide"><X /></button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIntent(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Anulează</button>
              <button type="button" onClick={continueIntent} className="rounded-lg bg-[#026a81] px-4 py-2 text-sm font-bold text-white hover:bg-[#003747]">Înainte</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
