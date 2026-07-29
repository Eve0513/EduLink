"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateProfileField } from "@/app/actions/onboarding";
import type { Profile } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileEditorProps {
  profile: Profile;
}

export function ProfileEditor({ profile: initialProfile }: ProfileEditorProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isPending, startTransition] = useTransition();
  const [savingField, setSavingField] = useState<string | null>(null);

  function optimisticUpdate(field: keyof Profile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function saveField(
    field: "full_name" | "headline" | "bio" | "location",
    value: string
  ) {
    setSavingField(field);
    startTransition(async () => {
      const result = await updateProfileField(field, value);
      if (result.error) {
        toast.error(result.error);
        setProfile(initialProfile);
      } else {
        toast.success("Salvat!");
      }
      setSavingField(null);
    });
  }

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil public</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{profile.full_name}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              {profile.qr_code_slug && (
                <p className="mt-1 font-mono text-xs text-primary">
                  /portofoliu/{profile.qr_code_slug}
                </p>
              )}
            </div>
          </div>

          <EditableField
            label="Nume complet"
            value={profile.full_name}
            onChange={(v) => optimisticUpdate("full_name", v)}
            onSave={(v) => saveField("full_name", v)}
            saving={savingField === "full_name" && isPending}
          />

          <EditableField
            label="Titlu profesional"
            value={profile.headline ?? ""}
            onChange={(v) => optimisticUpdate("headline", v)}
            onSave={(v) => saveField("headline", v)}
            saving={savingField === "headline" && isPending}
          />

          <EditableField
            label="Locație"
            value={profile.location ?? ""}
            onChange={(v) => optimisticUpdate("location", v)}
            onSave={(v) => saveField("location", v)}
            saving={savingField === "location" && isPending}
          />

          <div className="space-y-1.5">
            <Label>Despre</Label>
            <Textarea
              value={profile.bio ?? ""}
              onChange={(e) => optimisticUpdate("bio", e.target.value)}
              onBlur={(e) => saveField("bio", e.target.value)}
              placeholder="Descriere profesională..."
              maxLength={500}
            />
            {savingField === "bio" && isPending && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Se salvează...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  onSave,
  saving,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSave: (v: string) => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onSave(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onSave(value)}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
