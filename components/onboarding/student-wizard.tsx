"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { completeStudentOnboarding } from "@/app/actions/onboarding";
import {
  MOCK_UNIVERSITIES,
  MOCK_COLLEGES,
  MOCK_COMPANIES,
  MOCK_LOCATIONS,
  MOCK_SPECIALITIES,
  MOCK_JOB_TITLES,
} from "@/mockData";
import type {
  ContactStepData,
  EducationStepData,
  ExperienceStepData,
  ProjectStepData,
  SkillStepData,
} from "@/lib/validations/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Combobox, TagInput } from "@/components/ui/combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

const STEPS = [
  "Contact & Avatar",
  "Educație",
  "Experiență & Skills",
  "Proiecte & Revizuire",
];

const institutionOptions = [
  ...MOCK_UNIVERSITIES.map((u) => ({
    value: u.id,
    label: u.name,
    subtitle: "Universitate • Moldova",
  })),
  ...MOCK_COLLEGES.map((c) => ({
    value: c.id,
    label: c.name,
    subtitle: "Colegiu • Moldova",
  })),
];

const companyOptions = MOCK_COMPANIES.map((c) => ({
  value: c.id,
  label: c.name,
  subtitle: "Companie • Moldova",
}));

const locationOptions = MOCK_LOCATIONS.map((l) => ({
  value: l.id,
  label: l.name,
}));

const specialityOptions = MOCK_SPECIALITIES.map((s) => ({
  value: s.id,
  label: s.name,
  subtitle: s.field,
}));

const jobTitleOptions = MOCK_JOB_TITLES.map((j) => ({
  value: j.id,
  label: j.name,
  subtitle: j.category,
}));

const skillSuggestions = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "C#",
  "Python",
  "SQL",
  "Git",
  "Docker",
  "Figma",
].map((s, i) => ({ value: `skill-${i}`, label: s }));

const emptyEducation: EducationStepData = {
  institution_name: "",
  degree: "Licenta",
  field_of_study: "",
  start_date: "",
  end_date: null,
  is_current: false,
  gpa: null,
};

const emptyExperience: ExperienceStepData = {
  company_name: "",
  position_title: "",
  location: "",
  start_date: "",
  end_date: null,
  is_current: false,
  description: "",
};

const emptyProject: ProjectStepData = {
  title: "",
  description: "",
  github_url: null,
  live_demo_url: null,
  technologies: [],
  image_url: null,
};

export function StudentOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [contact, setContact] = useState<ContactStepData>({
    fullName: "",
    headline: "",
    bio: "",
    location: "",
    avatarUrl: null,
  });

  const [education, setEducation] = useState<EducationStepData>(emptyEducation);
  const [experience, setExperience] = useState<ExperienceStepData>(emptyExperience);
  const [skills, setSkills] = useState<SkillStepData[]>([]);
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillStepData["level"]>("Avansat");
  const [project, setProject] = useState<ProjectStepData>(emptyProject);

  const progress = ((step + 1) / STEPS.length) * 100;

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imaginea trebuie să fie sub 2MB");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast.error("Eroare la încărcarea avatarului");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    setContact((c) => ({ ...c, avatarUrl: publicUrl }));
    setAvatarPreview(URL.createObjectURL(file));
    toast.success("Avatar încărcat!");
  }

  function addSkill() {
    if (!skillName.trim()) return;
    if (skills.some((s) => s.name === skillName.trim())) {
      toast.error("Competența există deja");
      return;
    }
    setSkills([...skills, { name: skillName.trim(), level: skillLevel }]);
    setSkillName("");
  }

  function validateStep(): boolean {
    switch (step) {
      case 0:
        if (!contact.fullName || !contact.headline || !contact.location) {
          toast.error("Completează câmpurile obligatorii");
          return false;
        }
        return true;
      case 1:
        if (!education.institution_name || !education.field_of_study || !education.start_date) {
          toast.error("Completează datele de educație");
          return false;
        }
        return true;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  }

  function nextStep() {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else setConfirmOpen(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const result = await completeStudentOnboarding({
      contact,
      educations: education.institution_name ? [education] : [],
      experiences: experience.company_name ? [experience] : [],
      skills,
      projects: project.title ? [project] : [],
    });

    if (result.error) {
      toast.error(result.error);
      setSubmitting(false);
      return;
    }

    toast.success("Profil creat cu succes!");
    router.push("/dashboard/student/profile");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <Progress value={progress} className="rounded-none" />

      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 flex items-center gap-4">
          {step > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pasul {step + 1} din {STEPS.length}
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{STEPS[step]}</h1>
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-secondary">
                {avatarPreview || contact.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview || contact.avatarUrl || ""}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="absolute inset-0 opacity-0"
                  onChange={handleAvatarUpload}
                />
              </label>
              <p className="text-xs text-muted-foreground">
                PNG, JPG sau WEBP (max 2MB)
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Nume complet *</Label>
              <Input
                value={contact.fullName}
                onChange={(e) =>
                  setContact({ ...contact, fullName: e.target.value })
                }
                placeholder="ex: Maria Ionescu"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Titlu profesional *</Label>
              <Combobox
                options={jobTitleOptions}
                value={contact.headline}
                onChange={(v) => setContact({ ...contact, headline: v })}
                placeholder="ex: Student Informatică | React & TypeScript"
                creatable
              />
            </div>

            <div className="space-y-1.5">
              <Label>Locație *</Label>
              <Combobox
                options={locationOptions}
                value={contact.location}
                onChange={(v) => setContact({ ...contact, location: v })}
                placeholder="ex: Chișinău"
                creatable
              />
            </div>

            <div className="space-y-1.5">
              <Label>Despre tine</Label>
              <Textarea
                value={contact.bio}
                onChange={(e) => setContact({ ...contact, bio: e.target.value })}
                placeholder="Scurtă descriere profesională (max 500 caractere)"
                maxLength={500}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <Label>Instituție *</Label>
              <Combobox
                options={institutionOptions}
                value={education.institution_name}
                onChange={(v) =>
                  setEducation({ ...education, institution_name: v })
                }
                placeholder="Caută universitate sau colegiu..."
                creatable
              />
            </div>

            <div className="space-y-1.5">
              <Label>Diplomă *</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                value={education.degree}
                onChange={(e) =>
                  setEducation({
                    ...education,
                    degree: e.target.value as EducationStepData["degree"],
                  })
                }
              >
                <option value="Bacalaureat">Bacalaureat</option>
                <option value="Licenta">Licență</option>
                <option value="Master">Master</option>
                <option value="Doctorat">Doctorat</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Domeniu de studiu *</Label>
              <Combobox
                options={specialityOptions}
                value={education.field_of_study}
                onChange={(v) =>
                  setEducation({ ...education, field_of_study: v })
                }
                placeholder="ex: Informatică"
                creatable
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Data începerii *</Label>
                <Input
                  type="date"
                  value={education.start_date}
                  onChange={(e) =>
                    setEducation({ ...education, start_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Data finalizării</Label>
                <Input
                  type="date"
                  value={education.end_date ?? ""}
                  disabled={education.is_current}
                  onChange={(e) =>
                    setEducation({ ...education, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={education.is_current}
                onCheckedChange={(checked) =>
                  setEducation({ ...education, is_current: checked })
                }
              />
              <Label>În curs de studii</Label>
            </div>

            <div className="space-y-1.5">
              <Label>Media (GPA)</Label>
              <Input
                type="number"
                step="0.01"
                min="1"
                max="10"
                value={education.gpa ?? ""}
                onChange={(e) =>
                  setEducation({
                    ...education,
                    gpa: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="ex: 8.50"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Experiență profesională</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Titlu post *</Label>
                  <Combobox
                    options={jobTitleOptions}
                    value={experience.position_title}
                    onChange={(v) =>
                      setExperience({ ...experience, position_title: v })
                    }
                    placeholder="ex: Intern Software Developer"
                    creatable
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Companie / Angajator</Label>
                  <Combobox
                    options={companyOptions}
                    value={experience.company_name}
                    onChange={(v) =>
                      setExperience({ ...experience, company_name: v })
                    }
                    placeholder="ex: Orange Moldova"
                    creatable
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Locație</Label>
                  <Combobox
                    options={locationOptions}
                    value={experience.location ?? ""}
                    onChange={(v) =>
                      setExperience({ ...experience, location: v })
                    }
                    placeholder="ex: Chișinău"
                    creatable
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Data începerii</Label>
                    <Input
                      type="date"
                      value={experience.start_date}
                      onChange={(e) =>
                        setExperience({
                          ...experience,
                          start_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Data finalizării</Label>
                    <Input
                      type="date"
                      value={experience.end_date ?? ""}
                      disabled={experience.is_current}
                      onChange={(e) =>
                        setExperience({
                          ...experience,
                          end_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={experience.is_current}
                    onCheckedChange={(checked) =>
                      setExperience({ ...experience, is_current: checked })
                    }
                  />
                  <Label>Lucrez aici în prezent</Label>
                </div>
                <div className="space-y-1.5">
                  <Label>Descriere</Label>
                  <Textarea
                    value={experience.description}
                    onChange={(e) =>
                      setExperience({
                        ...experience,
                        description: e.target.value,
                      })
                    }
                    placeholder="Descrie responsabilitățile și realizările..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Competențe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <TagInput
                      tags={[]}
                      onChange={() => {}}
                      suggestions={skillSuggestions}
                      placeholder=""
                      maxTags={0}
                    />
                    <Input
                      value={skillName}
                      onChange={(e) => setSkillName(e.target.value)}
                      placeholder="ex: React, TypeScript, C#"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                  </div>
                  <select
                    className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
                    value={skillLevel}
                    onChange={(e) =>
                      setSkillLevel(e.target.value as SkillStepData["level"])
                    }
                  >
                    <option value="Începător">Începător</option>
                    <option value="Avansat">Avansat</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <Button type="button" variant="outline" onClick={addSkill}>
                    Adaugă
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <Badge key={s.name} variant="secondary">
                        {s.name} · {s.level}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Proiect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Titlu proiect</Label>
                  <Input
                    value={project.title}
                    onChange={(e) =>
                      setProject({ ...project, title: e.target.value })
                    }
                    placeholder="ex: Sistem Gestiune Stocuri"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Descriere</Label>
                  <Textarea
                    value={project.description}
                    onChange={(e) =>
                      setProject({ ...project, description: e.target.value })
                    }
                    placeholder="Descriere tehnică a proiectului..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tehnologii</Label>
                  <TagInput
                    tags={project.technologies}
                    onChange={(tags) =>
                      setProject({ ...project, technologies: tags })
                    }
                    suggestions={skillSuggestions}
                    placeholder="Scrie tehnologie și apasă Enter"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>GitHub URL</Label>
                    <Input
                      value={project.github_url ?? ""}
                      onChange={(e) =>
                        setProject({
                          ...project,
                          github_url: e.target.value || null,
                        })
                      }
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Demo Live URL</Label>
                    <Input
                      value={project.live_demo_url ?? ""}
                      onChange={(e) =>
                        setProject({
                          ...project,
                          live_demo_url: e.target.value || null,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revizuire profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ReviewRow label="Nume" value={contact.fullName} />
                <ReviewRow label="Titlu" value={contact.headline} />
                <ReviewRow label="Locație" value={contact.location} />
                <ReviewRow
                  label="Educație"
                  value={
                    education.institution_name
                      ? `${education.institution_name} — ${education.field_of_study}`
                      : "—"
                  }
                />
                <ReviewRow
                  label="Experiență"
                  value={
                    experience.company_name
                      ? `${experience.position_title} @ ${experience.company_name}`
                      : "—"
                  }
                />
                <ReviewRow
                  label="Competențe"
                  value={
                    skills.length > 0
                      ? skills.map((s) => s.name).join(", ")
                      : "—"
                  }
                />
                <ReviewRow
                  label="Proiect"
                  value={project.title || "—"}
                />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-10 flex justify-end">
          <Button onClick={nextStep} size="lg">
            {step === STEPS.length - 1 ? (
              <>
                <Check className="h-4 w-4" />
                Finalizează
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmi crearea profilului?</DialogTitle>
            <DialogDescription>
              Datele vor fi salvate în contul tău EduLink și vor fi vizibile
              companiilor și instituțiilor partenere din Moldova.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Revino
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Se salvează...
                </>
              ) : (
                "Publică profilul"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
