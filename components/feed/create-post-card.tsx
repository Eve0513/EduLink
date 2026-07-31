"use client";

import { CalendarDays, ImagePlus } from "lucide-react";
import { toast } from "sonner";

export function CreatePostCard({ name }: { name: string }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#e5f4f6] font-bold text-[#0e5e6f]">{name.slice(0, 1)}</div><button type="button" onClick={() => toast.info("Editorul de postări se deschide în curând.")} className="flex-1 rounded-full bg-slate-100 px-4 text-left text-sm text-slate-500 hover:bg-slate-200">Începe o postare sau un anunț...</button></div><div className="mt-3 grid grid-cols-2 border-t border-slate-100 pt-3"><QuickAction icon={<ImagePlus className="text-[#168a9b]" />} label="Postare" /><QuickAction icon={<CalendarDays className="text-amber-600" />} label="Eveniment" /></div></section>;
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) { return <button type="button" onClick={() => toast.info(`${label}: formularul este în pregătire.`)} className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">{icon}{label}</button>; }
