import Link from "next/link";
import { MailCheck } from "lucide-react";
import { EduLinkMark } from "@/components/auth/auth-layout";

export default async function ConfirmEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; error?: string }> }) {
  const { email, error } = await searchParams;
  return <main className="grid min-h-screen place-items-center bg-[#f8fafc] p-5"><section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-[#003747]/10 sm:p-10"><EduLinkMark /><div className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-full bg-[#e5f4f6] text-[#026a81]"><MailCheck className="h-8 w-8" /></div><h1 className="mt-5 text-2xl font-extrabold text-slate-900">Confirmă-ți e-mailul</h1><p className="mt-3 text-sm leading-6 text-slate-600">{error ? "Linkul de confirmare nu a putut fi validat. Cere un e-mail nou și deschide-l în același browser." : "Ți-am trimis un e-mail de confirmare"}{email ? <><br /><strong className="text-slate-800">{email}</strong></> : null}.</p><p className="mt-4 text-sm text-slate-500">După confirmare vei fi conectat(ă) automat și trimis(ă) la configurarea profilului.</p><Link href="/login" className="mt-7 inline-flex rounded-lg bg-[#026a81] px-5 py-3 font-semibold text-white transition hover:bg-[#003747]">Înapoi la autentificare</Link></section></main>;
}
