"use client";

import { useState } from "react";
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

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Cont creat cu succes! Verifică email-ul sau continuă.");
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <SocialAuthButtons />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#FAFAFA] px-2 text-muted-foreground dark:bg-[#090A0F]">
            sau cu email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Nume complet</Label>
          <Input
            id="fullName"
            placeholder="ex: Ion Popescu"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="ex: ion.popescu@utm.md"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Parolă</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 caractere, 1 majusculă, 1 cifră"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmă parola</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner label="Se creează contul..." /> : "Creează cont"}
        </Button>
      </form>

      <AuthFooterLink
        text="Ai deja cont?"
        linkText="Autentifică-te"
        href="/login"
      />
    </div>
  );
}
