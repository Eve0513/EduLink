"use client";

import { Check, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { regenerateOrganizationInviteCode, type OrganizationKind } from "@/app/actions/organization-content";

export function InviteCodeCard({
  code: initialCode,
  entity,
  kind,
}: {
  code: string | null;
  entity: "companie" | "instituție";
  kind: OrganizationKind;
}) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Codul de invitație a fost copiat.");
      window.setTimeout(() => setCopied(false), 1_800);
    } catch {
      toast.error("Codul nu a putut fi copiat. Selectează-l manual.");
    }
  }

  async function regenerateCode() {
    setRefreshing(true);
    const result = await regenerateOrganizationInviteCode(kind);
    setRefreshing(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setCode(result.code);
    toast.success("A fost generat un cod nou. Distribuie-l numai colegilor autorizați.");
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-[#168a9b]">Echipă și securitate</p>
      <h2 className="mt-2 text-lg font-extrabold text-slate-950">Codul de invitație al {entity === "companie" ? "companiei" : "instituției"}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Oferă codul numai colegilor autorizați. Un cod nou îl invalidează pe cel anterior.</p>
      {code ? <div className="mt-4 space-y-3">
        <code className="block rounded-lg bg-[#e5f4f6] px-3 py-3 text-center text-sm font-extrabold tracking-[0.14em] text-[#0e5e6f]">{code}</code>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={copyCode} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0e5e6f] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#084b59]">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copiat" : "Copiază"}</button>
          <button type="button" onClick={regenerateCode} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0e5e6f] px-3 py-2.5 text-sm font-bold text-[#0e5e6f] hover:bg-[#e5f4f6] disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? "Se schimbă" : "Regenerează"}</button>
        </div>
      </div> : <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Codul va apărea după aprobarea organizației.</p>}
    </section>
  );
}
