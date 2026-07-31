"use client";

import { useState } from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { AuthFooterLink } from "@/components/auth/auth-layout";
import { toast } from "sonner";

const checks = [{ label: "8+ caractere", match: (value: string) => value.length >= 8 }, { label: "O majusculă", match: (value: string) => /[A-Z]/.test(value) }, { label: "O cifră", match: (value: string) => /\d/.test(value) }, { label: "Un caracter special", match: (value: string) => /[^A-Za-z0-9]/.test(value) }];

export function RegisterForm() {
  const router = useRouter(); const [loading, setLoading] = useState(false); const [showPassword, setShowPassword] = useState(false); const supabase = createClient();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema), defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" } });
  const password = watch("password");
  async function onSubmit(data: RegisterFormData) {
    setLoading(true); const fullName = `${data.firstName} ${data.lastName}`;
    const { data: authData, error } = await supabase.auth.signUp({ email: data.email, password: data.password, options: { data: { full_name: fullName, first_name: data.firstName, last_name: data.lastName }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` } });
    if (error) { toast.error(error.message); setLoading(false); return; }
    if (!authData.session || !authData.user) { toast.success("Verifică email-ul pentru confirmarea contului, apoi continuă spre onboarding."); setLoading(false); return; }
    const { error: profileError } = await supabase.from("profiles").upsert({ id: authData.user.id, email: data.email, full_name: fullName, first_name: data.firstName, last_name: data.lastName }, { onConflict: "id" });
    if (profileError) { toast.error(`Cont creat, dar profilul nu a putut fi pregătit: ${profileError.message}`); setLoading(false); return; }
    toast.success("Cont creat cu succes!"); router.replace("/onboarding"); router.refresh();
  }
  return <div className="space-y-5"><SocialAuthButtons /><Divider /><form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Nume *" error={errors.lastName?.message}><Input placeholder="Popescu" autoComplete="family-name" {...register("lastName")} /></Field><Field label="Prenume *" error={errors.firstName?.message}><Input placeholder="Ion" autoComplete="given-name" {...register("firstName")} /></Field></div><Field label="Email *" error={errors.email?.message}><Input type="email" placeholder="ion.popescu@gmail.com" autoComplete="email" {...register("email")} /></Field><Field label="Parolă *" error={errors.password?.message}><div className="relative"><Input type={showPassword ? "text" : "password"} className="pr-11" autoComplete="new-password" {...register("password")} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ascunde parola" : "Arată parola"} className="absolute inset-y-0 right-3 text-slate-500">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><div className="mt-2 grid grid-cols-2 gap-1 text-xs">{checks.map((check) => <span key={check.label} className={check.match(password) ? "flex items-center gap-1 text-emerald-600" : "flex items-center gap-1 text-slate-500"}><CheckCircle2 className="h-3.5 w-3.5" />{check.label}</span>)}</div></Field><Field label="Confirmă parola *" error={errors.confirmPassword?.message}><Input type={showPassword ? "text" : "password"} autoComplete="new-password" {...register("confirmPassword")} /></Field><Button type="submit" className="w-full bg-[#026a81] text-white hover:bg-[#003747]" disabled={loading}>{loading ? <Spinner label="Se creează contul..." /> : "Înregistrează-te"}</Button></form><AuthFooterLink text="Ai deja cont?" linkText="Autentifică-te" href="/login" /></div>;
}
function Divider() { return <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div><div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-slate-500">sau cu email</span></div></div>; }
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div className="space-y-1.5"><Label>{label}</Label>{children}{error && <p className="text-xs text-red-600">{error}</p>}</div>; }
