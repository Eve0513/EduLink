"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Shield, Users } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#090A0F]">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-3">
        {/* Coloana stângă — Branding */}
        <div className="hidden flex-col justify-between border-r border-border bg-card p-10 lg:flex">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="EduLink"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold tracking-tight text-primary">
              EduLink
            </span>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Conectează educația cu piața muncii din Moldova
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Platformă hibridă pentru studenți, instituții și companii. Un singur
              profil digital, verificabil, partajabil prin link sau cod QR.
            </p>
            <div className="space-y-4">
              <Feature
                icon={GraduationCap}
                title="Studenți"
                description="CV ATS, portofoliu digital, aplicare 1-click"
              />
              <Feature
                icon={Shield}
                title="Instituții"
                description="Verificare diplome, programe Erasmus"
              />
              <Feature
                icon={Users}
                title="Companii"
                description="HR Engine, recrutare inteligentă"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EduLink Moldova
          </p>
        </div>

        {/* Coloana centrală — Formular */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-10">
          <div className="mx-auto w-full max-w-md space-y-8">
            <div className="space-y-2 text-center lg:text-left">
              <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
                <Image
                  src="/logo.png"
                  alt="EduLink"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-lg font-bold text-primary">EduLink</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>

        {/* Coloana dreaptă — Info */}
        <div className="hidden flex-col justify-center border-l border-border bg-secondary/30 p-10 lg:flex">
          <div className="space-y-6">
            <blockquote className="space-y-3">
              <p className="text-lg font-medium leading-relaxed text-foreground">
                „Actualizezi profilul o singură dată — EduLink distribuie datele
                verificate către angajatori și universități.”
              </p>
              <footer className="text-sm text-muted-foreground">
                — Misiunea EduLink
              </footer>
            </blockquote>
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Parteneri din Moldova
              </p>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                <li>Universitatea Tehnică a Moldovei (UTM)</li>
                <li>Orange Moldova</li>
                <li>Endava • Amdaris • maib</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function AuthFooterLink({
  text,
  linkText,
  href,
}: {
  text: string;
  linkText: string;
  href: string;
}) {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {text}{" "}
      <Link href={href} className="font-medium text-primary hover:underline">
        {linkText}
      </Link>
    </p>
  );
}
