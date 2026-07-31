import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Building2, GraduationCap, Network, Sparkles } from "lucide-react";

export function HeroSection() {
  return <section id="about" className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-18 sm:px-8 lg:grid-cols-2 lg:pt-28"><div className="max-w-2xl"><p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e4f4f6] px-4 py-2 text-sm font-semibold text-[#0e5e6f]"><Sparkles className="h-4 w-4" />Educație conectată cu oportunități reale</p><h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl">Bine ați venit la <span className="text-[#0e5e6f]">EduLink</span>: Platforma Inteligentă Către Succesul Tău</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Conectăm educația, performanța și oportunitățile profesionale.</p><div className="mt-8"><Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-[#0e5e6f] px-6 py-3.5 font-bold text-white shadow-lg shadow-[#0e5e6f]/20 transition hover:-translate-y-0.5 hover:bg-[#084b59]">Începe Acum – Înregistrare <ArrowRight className="h-4 w-4" /></Link><p className="mt-3 text-xs font-medium text-slate-500">Creează cont pentru acces. Obligatoriu.</p></div></div><div className="relative mx-auto flex w-full max-w-xl items-center justify-center overflow-hidden rounded-[2.5rem] p-4">
  <img 
    src="/landing-page.png" 
    alt="EduLink Network Illustration" 
    className="h-auto w-full object-contain rounded-2xl drop-shadow-xl"
  />
</div></section>;
}

function NetworkNode({ icon, label, className }: { icon: ReactNode; label: string; className: string }) { return <div className={`absolute ${className} rounded-2xl bg-white p-3 text-[#0e5e6f] shadow-lg`}><div className="flex items-center gap-2 text-sm font-bold">{icon}<span>{label}</span></div></div>; }
