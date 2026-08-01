"use client";

import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, ChevronDown, Home, LogOut, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { OrganizationKind } from "@/app/actions/organization-content";

export function OrganizationHeader({ kind, organizationName }: { kind: OrganizationKind; organizationName: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const dashboardPath = kind === "company" ? "/dashboard/company" : "/dashboard/institution";
  const settingsPath = `${dashboardPath}/settings`;
  const initials = organizationName.slice(0, 2).toUpperCase();

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) {
      toast.info("Scrie un nume, o instituție, o companie sau un job.");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  async function signOut() {
    const { error } = await createClient().auth.signOut();
    if (error) {
      toast.error("Nu te-am putut deconecta acum. Încearcă din nou.");
      return;
    }
    toast.success("Ai fost deconectat(ă) în siguranță.");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href={dashboardPath} className="flex shrink-0 items-center gap-2" aria-label="EduLink – pagina principală">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e5f4f6] p-1.5">
            <Image src="/edulink-logo-icon.png" alt="" width={40} height={40} className="h-full w-full object-contain" priority />
          </span>
          <span className="hidden bg-gradient-to-r from-[#003747] via-[#065465] to-[#026a81] bg-clip-text text-xl font-extrabold text-transparent sm:inline">EduLink</span>
        </Link>

        <form onSubmit={submitSearch} className="hidden min-w-0 max-w-md flex-1 md:block">
          <label className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-500 focus-within:ring-2 focus-within:ring-[#026a81]/25">
            <Search className="h-4 w-4" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Caută persoane, instituții și oportunități" className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
          </label>
        </form>

        <nav className="ml-auto flex h-[72px] items-center gap-1 sm:gap-3">
          <Link href={dashboardPath} className="flex h-full min-w-14 flex-col items-center justify-center gap-0.5 border-b-2 border-[#0e5e6f] px-2 text-xs font-semibold text-[#0e5e6f]">
            <Home className="h-4 w-4" />Acasă
          </Link>
          {kind === "company" ? <Link href={`${dashboardPath}#job-post`} className="flex h-full min-w-16 flex-col items-center justify-center gap-0.5 border-b-2 border-transparent px-2 text-xs font-semibold text-slate-500 transition hover:border-[#0e5e6f] hover:text-[#0e5e6f]">
            <BriefcaseBusiness className="h-4 w-4" />Job post
          </Link> : null}
        </nav>

        <div className="relative ml-1">
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="flex items-center gap-1 rounded-full p-1 transition hover:bg-slate-100" aria-expanded={menuOpen} aria-label="Deschide meniul organizației">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0e5e6f] text-xs font-extrabold text-white">{initials}</span>
            <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
          </button>
          {menuOpen ? <div className="absolute right-0 top-12 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <p className="px-3 py-2 text-sm font-semibold text-slate-900">{organizationName}</p>
            <Link href={settingsPath} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Settings className="h-4 w-4" />Echipă și securitate</Link>
            <button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Deconectare</button>
          </div> : null}
        </div>
      </div>
      <form onSubmit={submitSearch} className="border-t border-slate-100 px-4 py-2 md:hidden">
        <label className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-500 focus-within:ring-2 focus-within:ring-[#026a81]/25">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Caută în EduLink" className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
        </label>
      </form>
    </header>
  );
}
