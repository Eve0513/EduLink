import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  User,
  Sparkles,
  Briefcase,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/student/profile", label: "Profil", icon: User },
  { href: "/dashboard/student/ai-hub", label: "AI Hub", icon: Sparkles },
  { href: "/marketplace", label: "Oportunități", icon: Briefcase },
];

interface DashboardSidebarProps {
  currentPath: string;
}

export function DashboardSidebar({ currentPath }: DashboardSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between border-r border-border bg-card p-4 md:flex">
      <div className="space-y-6">
        <Link href="/dashboard" className="flex items-center gap-2 px-2">
          <Image src="/edulink-logo-icon.png" alt="EduLink" width={28} height={28} />
          <span className="text-lg font-bold tracking-tight text-primary">
            EduLink
          </span>
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <Link
        href="/login"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Deconectare
      </Link>
    </aside>
  );
}

export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-border pb-6">
      <div className="flex items-center gap-2 text-primary">
        <LayoutDashboard className="h-5 w-5" />
        <span className="text-xs font-medium uppercase tracking-wider">
          Dashboard Student
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
