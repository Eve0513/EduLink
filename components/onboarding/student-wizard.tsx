"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeStudentOnboarding, uploadAvatar } from "@/app/actions/onboarding";
import {
  HIGH_SCHOOL_PROFILES,
  MOCK_COLLEGES,
  MOCK_HIGH_SCHOOLS,
  MOCK_JOB_TITLES,
  MOCK_LOCATIONS,
  MOCK_SKILLS,
  MOCK_SPECIALITIES,
  MOCK_UNIVERSITIES,
} from "@/mockData";
import { normaliseRomanianDateInput, romanianDateToIso } from "@/lib/romanian-date";

const institutions = [...MOCK_HIGH_SCHOOLS, ...MOCK_COLLEGES, ...MOCK_UNIVERSITIES];
const inputClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#026a81] focus:ring-2 focus:ring-[#026a81]/20 disabled:cursor-not-allowed disabled:bg-slate-100";

type Skill = {
  name: string;
  level: "incepator" | "intermediar" | "avansat";
};

function isDate(value: string) {
  return romanianDateToIso(value) !== null;
}

function toIso(value: string) {
  return romanianDateToIso(value) ?? "";
}

export function StudentOnboardingWizard() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [attemptedStep, setAttemptedStep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("bacalaureat");
  const [field, setField] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(true);
  const [hasExperience, setHasExperience] = useState(false);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [experience, setExperience] = useState({ position: "", company: "", location: "", start: "", description: "" });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState<Skill["level"]>("incepator");

  const isHighSchool = MOCK_HIGH_SCHOOLS.some((item) => item.name === institution);
  const headings = ["Arată-ne cine ești.", "Construiește-ți parcursul.", "Spune-ne ce îți dorești.", "Revizuiește-ți profilul."];
  const errors = {
    firstName: !firstName.trim(),
    lastName: !lastName.trim(),
    location: !location,
    institution: !institution,
    field: !field,
    startDate: !isDate(startDate),
    endDate: !current && !isDate(endDate),
    jobTitles: jobTitles.length === 0,
  };

  function stepHasError(currentStep: number) {
    if (currentStep === 0) return errors.firstName || errors.lastName || errors.location;
    if (currentStep === 1) return errors.institution || errors.field || errors.startDate || errors.endDate;
    if (currentStep === 2) return errors.jobTitles;
    return false;
  }

  function focusFirstError() {
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("[data-onboarding-invalid='true'] input, [data-onboarding-invalid='true'] select")?.focus();
    });
  }

  function next() {
    if (stepHasError(step)) {
      setAttemptedStep(true);
      toast.error(step === 1 ? "Completează câmpurile obligatorii și folosește formatul dd/mm/yyyy." : "Completează câmpurile obligatorii marcate cu *.");
      focusFirstError();
      return;
    }
    setAttemptedStep(false);
    setStep((currentStep) => Math.min(3, currentStep + 1));
  }

  function previous() {
    setAttemptedStep(false);
    setStep((currentStep) => Math.max(0, currentStep - 1));
  }

  function chooseFile(file?: File) {
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|webp)$/) || file.size > 2 * 1024 * 1024) {
      toast.error("Alege un PNG, JPG sau WebP de maximum 2 MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    toast.success("Imagine încărcată cu succes. Va fi salvată la final.");
  }

  function addJobTitle(value: string) {
    if (!value || jobTitles.includes(value)) return;
    if (jobTitles.length >= 3) {
      toast.info("Poți selecta cel mult trei preferințe de job.");
      return;
    }
    setJobTitles((titles) => [...titles, value]);
  }

  function addSkill() {
    if (!skill) {
      toast.info("Alege o competență înainte de adăugare.");
      return;
    }
    if (skills.some((item) => item.name === skill)) {
      toast.info("Această competență este deja adăugată.");
      return;
    }
    setSkills((items) => [...items, { name: skill, level }]);
    setSkill("");
    toast.success("Competență adăugată.");
  }

  async function finish() {
    const invalidStep = [0, 1, 2].find(stepHasError);
    if (invalidStep !== undefined) {
      setStep(invalidStep);
      setAttemptedStep(true);
      toast.error("Mai sunt câteva informații obligatorii de completat.");
      focusFirstError();
      return;
    }

    setSaving(true);
    let avatarUrl: string | null = null;
    if (avatarFile) {
      const formData = new FormData();
      formData.set("file", avatarFile);
      const upload = await uploadAvatar(formData);
      if (upload.error) {
        toast.error(upload.error);
        setSaving(false);
        return;
      }
      avatarUrl = upload.url ?? null;
    }

    const result = await completeStudentOnboarding({
      firstName,
      lastName,
      location,
      bio,
      avatarUrl,
      education: {
        institution,
        degree,
        field,
        startDate: toIso(startDate),
        endDate: current ? "" : toIso(endDate),
        current,
      },
      desiredJobTitles: jobTitles,
      experiences: hasExperience && experience.position.trim()
        ? [{ ...experience, start: experience.start && isDate(experience.start) ? toIso(experience.start) : "" }]
        : [],
      skills,
    });

    if (result.error) {
      toast.error(result.error);
      setSaving(false);
      return;
    }
    toast.success("Profilul tău este gata. Te ducem în feed.");
    router.replace("/feed");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc] p-3 sm:p-8">
      <div className="pointer-events-none absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-[#168a9b]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#026a81]/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#0e5e6f14_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-white/80 bg-white shadow-xl lg:grid-cols-[280px_1fr]">
        <aside className="hidden bg-[linear-gradient(150deg,#003747,#0e5e6f_55%,#026a81)] p-8 text-white lg:block">
          <div className="flex items-center gap-2 text-xl font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 p-1"><img src="/edulink-logo-icon.png" alt="" className="h-full w-full object-contain" /></span>
            EduLink
          </div>
          <div className="mt-20 h-24 w-24 rounded-full border border-white/25 bg-white/10" />
          <h1 className="mt-8 text-3xl font-extrabold leading-tight">{headings[step]}</h1>
          <p className="mt-4 text-white/80">Profilul se poate completa ulterior, oricând.</p>
        </aside>

        <section className="p-5 sm:p-10">
          <div className="mb-7 flex gap-1.5">{[0, 1, 2, 3].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? "bg-[#026a81]" : "bg-slate-200"}`} />)}</div>
          <p className="text-sm font-bold text-[#026a81]">Pasul {step + 1} din 4</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-950">{["Informații personale", "Educație", "Experiență & competențe", "Rezumat & revizuire"][step]}</h2>

          {step === 0 ? (
            <div className="mt-6 space-y-4">
              <div>
                <button type="button" onClick={() => fileRef.current?.click()} className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border-2 border-dashed border-[#026a81] bg-[#e5f4f6]" aria-label="Încarcă fotografia de profil">
                  {avatarPreview ? <img src={avatarPreview} alt="Previzualizare" className="h-full w-full object-cover" /> : <Upload className="text-[#026a81]" />}
                </button>
                <input ref={fileRef} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => chooseFile(event.target.files?.[0])} />
                <p className="mt-2 text-xs text-slate-500">Fotografia este opțională. Poți adăuga una și mai târziu.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nume *" helper="Numele de familie din documente." invalid={attemptedStep && errors.lastName}><input className={inputClass} value={lastName} onChange={(event) => setLastName(event.target.value)} /></Field>
                <Field label="Prenume *" helper="Prenumele tău." invalid={attemptedStep && errors.firstName}><input className={inputClass} value={firstName} onChange={(event) => setFirstName(event.target.value)} /></Field>
              </div>
              <Field label="Locație *" helper="Orașul în care locuiești în prezent." invalid={attemptedStep && errors.location}>
                <select className={inputClass} value={location} onChange={(event) => setLocation(event.target.value)}><option value="">Selectează orașul</option>{MOCK_LOCATIONS.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select>
              </Field>
              <Field label="Despre tine (opțional)" helper="O scurtă descriere a intereselor tale."><textarea className={inputClass} value={bio} onChange={(event) => setBio(event.target.value)} /></Field>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="mt-6 space-y-4">
              <Field label="Instituție *" helper="Liceu, colegiu sau universitate." invalid={attemptedStep && errors.institution}>
                <select className={inputClass} value={institution} onChange={(event) => { setInstitution(event.target.value); setField(""); }}><option value="">Selectează instituția</option>{institutions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select>
              </Field>
              <Field label="Diplomă obținută sau în curs de obținere *" helper="Selectează programul de studii.">
                <select className={inputClass} value={degree} onChange={(event) => setDegree(event.target.value)}><option value="bacalaureat">Bacalaureat</option><option value="licenta">Licență</option><option value="master">Master</option><option value="doctorat">Doctorat</option><option value="bacalaureat_licenta">Bacalaureat + Licență</option></select>
              </Field>
              <Field label="Specializare *" helper={isHighSchool ? "Alege profilul liceal." : "Alege programul de studii."} invalid={attemptedStep && errors.field}>
                <select className={inputClass} value={field} onChange={(event) => setField(event.target.value)}><option value="">Selectează specializarea</option>{(isHighSchool ? HIGH_SCHOOL_PROFILES : MOCK_SPECIALITIES).map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Data începerii *" helper="Folosește formatul dd/mm/yyyy." invalid={attemptedStep && errors.startDate}><input inputMode="numeric" placeholder="dd/mm/yyyy" className={inputClass} value={startDate} onChange={(event) => setStartDate(normaliseRomanianDateInput(event.target.value))} /></Field>
                <Field label="Data absolvirii" helper="Folosește formatul dd/mm/yyyy." invalid={attemptedStep && errors.endDate}><input inputMode="numeric" placeholder="dd/mm/yyyy" disabled={current} className={inputClass} value={endDate} onChange={(event) => setEndDate(normaliseRomanianDateInput(event.target.value))} /></Field>
              </div>
              <button type="button" onClick={() => setCurrent((value) => !value)} className={`rounded-lg px-4 py-2 text-sm font-bold ${current ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>{current ? "✓ Sunt în curs de studii" : "Nu sunt în curs de studii"}</button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-6 space-y-5">
              <p className="font-bold text-slate-900">Ai experiență profesională / internship-uri până acum?</p>
              <div className="flex gap-3"><button type="button" onClick={() => setHasExperience(true)} className={`rounded-lg px-6 py-2 font-bold ${hasExperience ? "bg-[#026a81] text-white" : "border border-slate-300"}`}>DA</button><button type="button" onClick={() => setHasExperience(false)} className={`rounded-lg px-6 py-2 font-bold ${!hasExperience ? "bg-[#026a81] text-white" : "border border-slate-300"}`}>NU</button></div>
              <Field label="Preferințe job / Titlu job dorit *" helper="Alege între 1 și 3 roluri." invalid={attemptedStep && errors.jobTitles}>
                <select className={inputClass} value="" onChange={(event) => addJobTitle(event.target.value)}><option value="">Adaugă un rol</option>{MOCK_JOB_TITLES.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select>
                <div className="mt-2 flex flex-wrap gap-2">{jobTitles.map((item) => <button type="button" key={item} onClick={() => setJobTitles((titles) => titles.filter((title) => title !== item))} className="rounded-full bg-[#e5f4f6] px-3 py-1 text-sm text-[#003747]">{item} <X className="inline h-3 w-3" /></button>)}</div>
              </Field>
              {hasExperience ? <div className="space-y-3 rounded-xl border border-slate-200 p-4"><Field label="Titlu experiență" helper="De exemplu: Internship Frontend Developer."><input className={inputClass} value={experience.position} onChange={(event) => setExperience({ ...experience, position: event.target.value })} /></Field><Field label="Angajator (opțional)"><input className={inputClass} value={experience.company} onChange={(event) => setExperience({ ...experience, company: event.target.value })} /></Field></div> : null}
              <div className="rounded-xl border border-slate-200 p-4"><p className="font-bold text-slate-900">Competențe</p><div className="mt-3 grid gap-2 sm:grid-cols-[1fr_160px_auto]"><select className={inputClass} value={skill} onChange={(event) => setSkill(event.target.value)}><option value="">Alege skill</option>{MOCK_SKILLS.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select><select className={inputClass} value={level} onChange={(event) => setLevel(event.target.value as Skill["level"])}><option value="incepator">Începător</option><option value="intermediar">Intermediar</option><option value="avansat">Avansat</option></select><button type="button" onClick={addSkill} className="rounded-lg bg-[#026a81] px-4 py-2 text-sm font-bold text-white">Adaugă</button></div><div className="mt-3 flex flex-wrap gap-2">{skills.map((item) => <button type="button" key={item.name} onClick={() => setSkills((items) => items.filter((skillItem) => skillItem.name !== item.name))} className="rounded-full bg-slate-100 px-3 py-1 text-sm">{item.name} · {item.level} <X className="inline h-3 w-3" /></button>)}</div></div>
            </div>
          ) : null}

          {step === 3 ? <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm"><Row label="Nume" value={`${firstName} ${lastName}`} /><Row label="Locație" value={location} /><Row label="Educație" value={`${institution} · ${field}`} /><Row label="Preferințe job" value={jobTitles.join(", ")} /><Row label="Skills" value={skills.map((item) => item.name).join(", ") || "Nu ai adăugat încă"} /></div> : null}

          <div className="mt-8 flex justify-between gap-3">{step > 0 ? <button type="button" onClick={previous} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-bold"><ArrowLeft className="h-4 w-4" />Înapoi</button> : <span />}{step < 3 ? <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-lg bg-[#026a81] px-5 py-2 font-bold text-white hover:bg-[#003747]">Continuă<ArrowRight className="h-4 w-4" /></button> : <button type="button" disabled={saving} onClick={finish} className="inline-flex items-center gap-2 rounded-lg bg-[#026a81] px-5 py-2 font-bold text-white hover:bg-[#003747] disabled:opacity-70">{saving ? "Se salvează..." : "Finalizează & Mergi la Dashboard"}<Check className="h-4 w-4" /></button>}</div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, helper, children, invalid = false }: { label: string; helper?: string; children: ReactNode; invalid?: boolean }) {
  return <label data-onboarding-invalid={invalid || undefined} className={`block rounded-lg text-sm font-bold text-slate-900 ${invalid ? "border border-red-500 bg-red-50 p-2" : ""}`}>{label}{helper ? <span className="mt-1 block text-xs font-normal text-slate-500">{helper}</span> : null}{children}{invalid ? <span className="mt-1 block text-xs font-medium text-red-700">Completează acest câmp pentru a continua.</span> : null}</label>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div><b>{label}</b><p className="mt-1 text-slate-600">{value || "—"}</p></div>;
}
