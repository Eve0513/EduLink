"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  GraduationCap,
  Landmark,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { updateUserRole } from "@/app/actions/onboarding";
import type { UserRole } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const roles = [
  {
    id: "student" as UserRole,
    title: "Student",
    description:
      "Construiește profilul academic, generează CV ATS și aplică la joburi din Moldova.",
    icon: GraduationCap,
  },
  {
    id: "institution" as UserRole,
    title: "Instituție",
    description:
      "Publică burse, programe Erasmus și verifică diplomele studenților.",
    icon: Landmark,
  },
  {
    id: "company" as UserRole,
    title: "Companie",
    description:
      "Postează joburi, accesează HR Engine și recrutează talente verificate.",
    icon: Building2,
  },
];

export function RoleSelectForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selected) {
      toast.error("Selectează un rol pentru a continua");
      return;
    }

    setLoading(true);
    const result = await updateUserRole(selected);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success("Rol setat cu succes!");

    if (selected === "student") {
      router.push("/onboarding/student");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selected === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelected(role.id)}
              className="text-left"
            >
              <Card
                className={cn(
                  "h-full cursor-pointer transition-all hover:border-primary hover:shadow-sm",
                  isSelected && "border-primary ring-2 ring-primary/20"
                )}
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-primary"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{role.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!selected || loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Se salvează...
            </>
          ) : (
            <>
              Continuă
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
