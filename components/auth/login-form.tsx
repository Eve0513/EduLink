"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { AuthFooterLink } from "@/components/auth/auth-layout";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter(); const [loading, setLoading] = useState(false); const [showPassword, setShowPassword] = useState(false); const supabase = createClient();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  async function onSubmit(data: LoginFormData) { setLoading(true); const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password }); if (error) { toast.error("Email sau parolă incorectă. Verifică datele și încearcă din nou."); setLoading(false); return; } toast.success("Autentificare reușită!"); router.refresh(); router.replace("/dashboard"); }
  return <div className="space-y-5"><SocialAuthButtons /><Divider /><form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><div className="space-y-1.5"><Label htmlFor="email">Email *</Label><Input id="email" type="email" autoComplete="email" placeholder="student@gmail.com" {...register("email")} />{errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}</div><div className="space-y-1.5"><Label htmlFor="password">Parolă *</Label><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} className="pr-11" autoComplete="current-password" {...register("password")} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 text-slate-500" aria-label={showPassword ? "Ascunde parola" : "Arată parola"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}</div><Button type="submit" className="w-full bg-[#026a81] text-white hover:bg-[#003747]" disabled={loading}>{loading ? <Spinner label="Se autentifică..." /> : "Autentifică-te"}</Button></form><AuthFooterLink text="Nu ai cont?" linkText="Creează unul" href="/signup" /></div>;
}
function Divider() { return <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div><div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-slate-500">sau cu email</span></div></div>; }
