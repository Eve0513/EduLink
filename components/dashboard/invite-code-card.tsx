"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function InviteCodeCard({ code, entity }: { code: string | null; entity: "companie" | "instituție" }) {
  const [copied, setCopied] = useState(false);
  async function copyCode() { if (!code) return; await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-bold text-[#168a9b]">ECHIPĂ & SECURITATE</p><h2 className="mt-2 text-xl font-extrabold">Codul de invitație al {entity === "companie" ? "companiei" : "instituției"}</h2><p className="mt-2 text-sm leading-6 text-slate-600">Oferă codul numai colegilor autorizați. Oricine îl are poate solicita aderarea la echipă.</p>{code ? <div className="mt-5 flex flex-wrap items-center gap-3"><code className="rounded-lg bg-[#e5f4f6] px-4 py-3 text-lg font-extrabold tracking-widest text-[#0e5e6f]">{code}</code><button onClick={copyCode} className="inline-flex items-center gap-2 rounded-lg bg-[#0e5e6f] px-4 py-3 text-sm font-bold text-white hover:bg-[#084b59]">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copiat" : "Copiază"}</button></div> : <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Codul va apărea după crearea și aprobarea organizației.</p>}</section>;
}
