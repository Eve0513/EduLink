import Link from "next/link";
import { BarChart3, GraduationCap } from "lucide-react";

export function Brand() {
  return <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-[#0e5e6f]"><span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[#0e5e6f] text-white"><img src="/EduLink_logo.png" alt="EduLink Logo" className="h-9 w-auto object-contain" /> </span>EduLink</Link>;
}

export function Navbar() {
  return <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur"><nav className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 py-3 sm:px-8"><Brand /><div className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex"><a href="#about" className="hover:text-[#0e5e6f]">Despre noi</a><a href="#features" className="hover:text-[#0e5e6f]">Funcționalități</a><a href="#for-who" className="hover:text-[#0e5e6f]">Pentru cine</a><a href="#testimonials" className="hover:text-[#0e5e6f]">Povești</a></div><div className="flex items-center gap-3 text-sm font-semibold"><Link href="/login" className="hidden px-2 py-2 text-[#0e5e6f] hover:underline sm:inline">Log In</Link><Link href="/signup" className="rounded-lg bg-[#0e5e6f] px-4 py-2.5 text-white shadow-sm transition hover:bg-[#084b59]">Înregistrare</Link></div></nav></header>;
}
