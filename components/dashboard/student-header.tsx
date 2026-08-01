"use client";

import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, ChevronDown, Home, LogOut, Search, Settings, Sparkles, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type StudentHeaderProps = { name: string; avatarUrl: string | null; current: "home" | "profile" | "ai" | "jobs" };

export function StudentHeader({ name, avatarUrl, current }: StudentHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const nav = [{ href: "/feed", label: "Acasă", icon: Home, key: "home" }, { href: "/dashboard/student/ai-hub", label: "AI Hub", icon: Sparkles, key: "ai" }, { href: "/marketplace", label: "Joburi", icon: BriefcaseBusiness, key: "jobs" }] as const;

  function submitSearch(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); toast.info(query.trim() ? `Căutarea pentru „${query.trim()}” va fi disponibilă în curând.` : "Scrie un nume, o instituție sau o oportunitate."); }
  async function signOut() { const { error } = await createClient().auth.signOut(); if (error) { toast.error("Nu te-am putut deconecta. Încearcă din nou."); return; } toast.success("Ai fost deconectat(ă) în siguranță."); router.push("/"); router.refresh(); }

  return <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex h-18 max-w-7xl items-center gap-3 px-4 sm:px-6"><Link href="/dashboard" className="flex shrink-0 items-center gap-2" aria-label="EduLink acasă"><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-[#e5f4f6]"><Image src="/logo.png" alt="" width={96} height={96} className="h-20 w-20 max-w-none -translate-y-2 object-cover" /></span><span className="hidden bg-gradient-to-r from-[#003747] via-[#065465] to-[#026a81] bg-clip-text text-xl font-extrabold text-transparent sm:inline">EduLink</span></Link><form onSubmit={submitSearch} className="hidden min-w-0 max-w-sm flex-1 md:block"><label className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-500 focus-within:ring-2 focus-within:ring-[#026a81]/25"><Search className="h-4 w-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Caută persoane, instituții și oportunități" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" /></label></form><nav className="ml-auto flex h-full items-center gap-1 sm:gap-3">{nav.map((item) => { const Icon = item.icon; const active = current === item.key; return <Link key={item.href} href={item.href} className={`flex h-full min-w-14 flex-col items-center justify-center gap-0.5 border-b-2 px-2 text-xs font-semibold transition ${active ? "border-[#0e5e6f] text-[#0e5e6f]" : "border-transparent text-slate-500 hover:text-[#0e5e6f]"}`}><Icon className="h-4 w-4" />{item.label}</Link>; })}</nav><div className="relative ml-1"><button type="button" onClick={() => setMenuOpen((value) => !value)} className="flex items-center gap-1 rounded-full p-1 transition hover:bg-slate-100" aria-expanded={menuOpen} aria-label="Deschide meniul contului">{avatarUrl && !avatarFailed ? <img src={avatarUrl} alt="Profilul meu" onError={() => setAvatarFailed(true)} className="h-[34px] w-[34px] rounded-full object-cover" /> : <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#e5f4f6] text-xs font-bold text-[#0e5e6f]">{initials}</span>}<ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" /></button>{menuOpen ? <div className="absolute right-0 top-12 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"><p className="px-3 py-2 text-sm font-semibold text-slate-900">{name}</p><Link href="/dashboard/student/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><UserRound className="h-4 w-4" />Profilul meu</Link><Link href="/dashboard/student/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Settings className="h-4 w-4" />Setări profil</Link><button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Deconectare</button></div> : null}</div></div></header>;
}
