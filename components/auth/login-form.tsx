"use client";

import { useState } from "react";
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Email sau parolă incorectă"
          : error.message
      );
      setLoading(false);
      return;
    }

    toast.success("Autentificare reușită!");
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
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="ex: student@utm.md"
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
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner label="Se autentifică..." /> : "Autentificare"}
        </Button>
      </form>

      <AuthFooterLink
        text="Nu ai cont?"
        linkText="Înregistrează-te"
        href="/register"
      />
    </div>
  );
}
