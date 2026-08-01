import Image from "next/image";
import Link from "next/link";
import { GraduationCap, ShieldCheck } from "lucide-react";

interface AuthLayoutProps { children: React.ReactNode; title: string; subtitle: string; }

export function EduLinkMark({ light = false }: { light?: boolean }) {
  return <Link href="/" className="inline-flex items-center gap-2.5" aria-label="EduLink acasă"><span className={`grid h-11 w-11 place-items-center overflow-hidden rounded-xl ${light ? "bg-white shadow-sm" : "bg-[#e5f4f6]"}`}><Image src="/edulink-logo-icon.png" alt="" width={64} height={64} className="h-9 w-9 object-contain" /></span><span className={`bg-gradient-to-r ${light ? "from-white to-[#a6eff3]" : "from-[#003747] via-[#065465] to-[#026a81]"} bg-clip-text text-2xl font-extrabold tracking-tight text-transparent`}>EduLink</span></Link>;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f8fafc] p-4 sm:p-8"><div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[#06768d]/20 blur-3xl" /><div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#026a81]/15 blur-3xl" /><div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl shadow-[#003747]/15 lg:grid-cols-[0.9fr_1.1fr]"><aside className="hidden min-h-[700px] flex-col justify-between bg-gradient-to-br from-[#003747] via-[#065465] to-[#026a81] p-9 text-white lg:flex"><EduLinkMark light /><div><GraduationCap className="mb-6 h-20 w-20 text-white/90" /><h2 className="text-3xl font-extrabold leading-tight">Descoperă o cale mai inteligentă spre succesul tău.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-white/80">Alătură-te rețelei educaționale din Moldova și conectează-te cu oportunități reale.</p><div className="mt-8 flex items-center gap-2 text-sm text-white/85"><ShieldCheck className="h-4 w-4" />Profil sigur și verificabil</div></div><p className="text-xs text-white/70">© 2026 EduLink Moldova</p></aside><section className="min-h-[700px] px-6 py-10 sm:px-12"><div className="mx-auto w-full max-w-md"><div className="mb-8 lg:hidden"><EduLinkMark /></div><h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1><p className="mt-2 text-sm text-slate-600">{subtitle}</p><div className="mt-8">{children}</div></div></section></div></main>;
}

export function AuthFooterLink({ text, linkText, href }: { text: string; linkText: string; href: string }) { return <p className="text-center text-sm text-slate-600">{text} <Link href={href} className="font-bold text-[#026a81] hover:underline">{linkText}</Link></p>; }
