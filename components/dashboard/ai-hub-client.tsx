"use client";

import { useState } from "react";
import { Loader2, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DashboardSidebar,
  DashboardHeader,
} from "@/components/dashboard/sidebar";

export function AIHubClient({ portfolioSlug }: { portfolioSlug: string | null }) {
  const [generating, setGenerating] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);

  async function handleGenerateCV() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-cv", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Eroare la generarea CV-ului");
        return;
      }

      setAtsScore(data.ats_score ?? null);
      toast.success(`CV generat! Scor ATS: ${data.ats_score ?? "N/A"}%`);
    } catch {
      toast.error("Eroare de rețea");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar currentPath="/dashboard/student/ai-hub" />
      <main className="md:pl-64">
        <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
          <DashboardHeader
            title="AI Hub"
            subtitle="Generează CV optimizat ATS și publică portofoliul"
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Generează CV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  AI-ul analizează experiența ta și generează un CV optimizat
                  pentru sisteme ATS.
                </p>
                {atsScore !== null && (
                  <p className="text-sm font-medium text-primary">
                    Ultimul scor ATS: {atsScore}%
                  </p>
                )}
                <Button
                  onClick={handleGenerateCV}
                  disabled={generating}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI-ul analizează experiența ta...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generează CV cu AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  Portofoliu public
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Profilul tău este accesibil public prin link unic.
                </p>
                {portfolioSlug ? (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={`/portofoliu/${portfolioSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Afișează portofoliul
                    </a>
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Slug-ul portofoliului nu este disponibil.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
