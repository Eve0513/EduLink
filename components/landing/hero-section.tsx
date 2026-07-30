import Link from "next/link";
import { Building2, GraduationCap, MessageCircle, Network, UserRoundCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section id="about" className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
      <div className="flex flex-col justify-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#168A9B]">Ecosistem academic si profesional</p>
        <h1 className="max-w-xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
          Bine ati venit la <span className="text-[#0E5E6F]">EduLink</span>: Platforma Inteligenta Catre Succesul Tau
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          Conectam educatia, performanta si oportunitatile profesionale.
        </p>
        <div className="mt-8">
          <Link href="/signup" className="inline-flex items-center rounded-md bg-[#0E5E6F] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#065465]">
            Incepe acum - Inregistrare
          </Link>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Creeaza cont pentru acces. Obligatoriu.</p>
        </div>
      </div>
      <div className="relative min-h-80 overflow-hidden border-y border-[#b9d7dc] bg-[#eef8f9] p-8 sm:min-h-96 dark:bg-[#123741]">
        <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#168A9B]/30" />
        <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#0E5E6F] text-white shadow-lg">
          <GraduationCap className="h-12 w-12" />
        </div>
        <Node className="left-8 top-10" label="Student" icon={<UserRoundCheck />} />
        <Node className="right-8 top-16" label="Companie" icon={<Building2 />} />
        <Node className="bottom-10 left-1/2 -translate-x-1/2" label="Institutie" icon={<GraduationCap />} />
        <div className="absolute left-[28%] top-[31%] h-px w-[45%] rotate-[17deg] bg-[#168A9B]" />
        <div className="absolute bottom-[29%] left-[29%] h-px w-[42%] -rotate-[25deg] bg-[#168A9B]" />
        <Network className="absolute right-[31%] top-[42%] h-6 w-6 text-[#168A9B]" />
        <MessageCircle className="absolute left-[31%] bottom-[31%] h-6 w-6 text-[#168A9B]" />
      </div>
    </section>
  );
}

function Node({ className, label, icon }: { className: string; label: string; icon: React.ReactNode }) {
  return <div className={`absolute flex items-center gap-2 rounded-md border border-[#a8d0d7] bg-white px-3 py-2 text-sm font-semibold text-[#0E5E6F] shadow-sm dark:bg-[#173f49] ${className}`}>{icon}{label}</div>;
}
