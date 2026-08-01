"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  ImagePlus,
  MapPin,
  Pencil,
  Plus,
  QrCode,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { removeAvatar, saveStudentProfileBasics, uploadAvatar, uploadProfileBackground } from "@/app/actions/onboarding";
import {
  deleteCertificate,
  deleteEducation,
  deleteExperience,
  deleteProject,
  deleteRecommendationRequest,
  deleteSkill,
  saveCertificate,
  saveEducation,
  saveExperience,
  saveProject,
  saveRecommendationRequest,
  saveSkill,
  uploadProfileMedia,
} from "@/app/actions/student-profile";
import { StudentHeader } from "@/components/dashboard/student-header";
import { MOCK_SKILLS } from "@/mockData";

type StudentProfile = {
  full_name: string;
  email: string;
  headline: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  background_url: string | null;
  qr_code_slug: string | null;
};
type Education = {
  id: string;
  institution_name: string;
  degree: "bacalaureat" | "licenta" | "master" | "doctorat" | "bacalaureat_licenta";
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean | null;
};
type Experience = {
  id: string;
  company_name: string | null;
  position_title: string;
  location: string | null;
  work_mode: "onsite" | "hybrid" | "remote" | null;
  job_type: "fulltime" | "parttime" | "contract" | "volunteer" | "temporary" | "internship" | "other" | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean | null;
  description: string | null;
};
type Skill = { id: string; name: string; level: "incepator" | "intermediar" | "avansat" };
type Project = { id: string; title: string; description: string | null; github_url: string | null; live_demo_url: string | null; technologies: string[] | null; image_url: string | null };
type Certificate = { id: string; title: string; issuing_organization: string; issue_date: string | null; expiry_date: string | null; credential_url: string | null };
type Recommendation = { id: string; recipient_name: string; recipient_email: string; relationship: string | null; message: string | null; status: "draft" | "requested" | "received" | "declined"; created_at: string };
type ModalKind = "education" | "experience" | "skill" | "project" | "certificate" | "recommendation";
type Selectable = Education | Experience | Skill | Project | Certificate | Recommendation | null;
type ActionResult = { success: true } | { error: string };

export function StudentProfileClient({
  profile,
  educations,
  experiences,
  skills,
  projects,
  certificates,
  recommendations,
  desiredJobTitles,
}: {
  profile: StudentProfile;
  educations: Education[];
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  certificates: Certificate[];
  recommendations: Recommendation[];
  desiredJobTitles: string[];
}) {
  const [draft, setDraft] = useState({
    fullName: profile.full_name,
    headline: profile.headline ?? "",
    location: profile.location ?? "",
    bio: profile.bio ?? "",
    desiredJobs: desiredJobTitles.join(", "),
  });
  const [editingBasics, setEditingBasics] = useState(false);
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [selected, setSelected] = useState<Selectable>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);
  const backgroundInput = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const initials = initialsFor(profile.full_name);
  const portfolioUrl = profile.qr_code_slug ? `/portofoliu/${profile.qr_code_slug}` : null;

  function openModal(kind: ModalKind, item: Selectable = null) {
    setSelected(item);
    setModal(kind);
  }

  function saveBasics() {
    startTransition(async () => {
      const result = await saveStudentProfileBasics({ ...draft, desiredJobTitles: draft.desiredJobs.split(",").map((title) => title.trim()).filter(Boolean) });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setEditingBasics(false);
      toast.success("Modificările de bază au fost salvate.");
    });
  }

  function chooseAvatar(file: File | undefined) {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/) || file.size > 5 * 1024 * 1024) {
      toast.error("Alege o imagine JPG, PNG sau WebP mai mică de 5 MB.");
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadAvatar(formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setAvatarFailed(false);
      toast.success("Imaginea de profil a fost actualizată.");
    });
  }

  function deleteAvatar() {
    if (!window.confirm("Dorești să elimini fotografia de profil?")) return;
    startTransition(async () => {
      const result = await removeAvatar();
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setAvatarFailed(true);
      toast.success("Fotografia de profil a fost eliminată.");
    });
  }

  function chooseBackground(file: File | undefined) {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/) || file.size > 5 * 1024 * 1024) { toast.error("Alege o imagine JPG, PNG sau WebP mai mică de 5 MB."); return; }
    startTransition(async () => {
      const formData = new FormData(); formData.set("file", file);
      const result = await uploadProfileBackground(formData);
      if ("error" in result) { toast.error(result.error); return; }
      toast.success("Imaginea de fundal a fost actualizată.");
    });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f8f9]">
      <StudentHeader name={profile.full_name} avatarUrl={avatarFailed ? null : profile.avatar_url} current="profile" />
      <div className="pointer-events-none fixed -left-32 top-44 h-96 w-96 rounded-full bg-[#0e5e6f]/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-24 top-80 h-80 w-80 rounded-full bg-[#168a9b]/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-6 px-4 py-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6">
        <section className="space-y-5">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-28 bg-[linear-gradient(115deg,#003747,#0e5e6f_55%,#168a9b)]" style={profile.background_url ? { backgroundImage: `linear-gradient(115deg,rgba(0,55,71,.45),rgba(14,94,111,.35)), url(${profile.background_url})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}><button type="button" onClick={() => backgroundInput.current?.click()} className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-2 text-xs font-bold text-[#0e5e6f] shadow-sm hover:bg-white"><ImagePlus className="mr-1 inline h-4 w-4" />Schimbă fundalul</button><input ref={backgroundInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => chooseBackground(event.target.files?.[0])} /></div>
            <div className="px-5 pb-6 sm:px-7">
              <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <button type="button" onClick={() => avatarInput.current?.click()} className="group relative shrink-0 rounded-full" aria-label="Editează fotografia de profil">
                    {profile.avatar_url && !avatarFailed ? (
                      <img src={profile.avatar_url} alt="Fotografia de profil" onError={() => setAvatarFailed(true)} className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md" />
                    ) : (
                      <span className="grid h-28 w-28 place-items-center rounded-full border-4 border-white bg-[#e5f4f6] text-3xl font-extrabold text-[#0e5e6f] shadow-md">{initials}</span>
                    )}
                    <span className="absolute inset-0 grid place-items-center rounded-full bg-slate-950/55 text-white opacity-0 transition group-hover:opacity-100"><Pencil className="h-5 w-5" /></span>
                  </button>
                  <input ref={avatarInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => chooseAvatar(event.target.files?.[0])} />
                  <div className="pb-1">
                    <h1 className="text-2xl font-extrabold text-slate-950">{draft.fullName || "Profil EduLink"}</h1>
                    <p className="mt-1 font-medium text-slate-600">{draft.headline || "Student EduLink"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.avatar_url && !avatarFailed ? <button type="button" onClick={deleteAvatar} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" />Șterge poza</button> : null}
                  <button type="button" onClick={() => setEditingBasics((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0e5e6f] px-4 py-2 text-sm font-bold text-[#0e5e6f] transition hover:bg-[#e5f4f6]"><Pencil className="h-4 w-4" />Editează profilul</button>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#168a9b]" />{draft.location || "Adaugă locația"}</span>
                <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="h-4 w-4 text-[#168a9b]" />{desiredJobTitles.length ? desiredJobTitles.join(" · ") : "Adaugă preferințe job"}</span>
              </div>
            </div>
          </article>

          {editingBasics ? <BasicEditor draft={draft} pending={pending} onChange={setDraft} onSave={saveBasics} /> : null}

          <ProfileSection title="Despre mine" icon={<FileText className="h-5 w-5 text-[#0e5e6f]" />} onEdit={() => setEditingBasics(true)}>
            <p className="whitespace-pre-wrap leading-7 text-slate-700">{draft.bio || "Adaugă o scurtă descriere pentru ca instituțiile și companiile să te cunoască mai bine."}</p>
          </ProfileSection>

          <ProfileSection title="Educație" icon={<GraduationCap className="h-5 w-5 text-[#0e5e6f]" />} onAdd={() => openModal("education")}>
            {educations.length ? <div className="space-y-5">{educations.map((education) => <Entry key={education.id} onEdit={() => openModal("education", education)} onDelete={() => deleteEntry(() => deleteEducation(education.id), "Studiile au fost șterse.")}><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e5f4f6] text-[#0e5e6f]"><GraduationCap className="h-5 w-5" /></div><div><h3 className="font-bold text-slate-900">{education.institution_name}</h3><p className="text-sm text-slate-600">{degreeLabel(education.degree)} · {education.field_of_study}</p><p className="mt-1 text-sm text-slate-500">{formatDate(education.start_date)} – {education.is_current ? "În curs" : formatDate(education.end_date)}</p></div></Entry>)}</div> : <AddSection label="Adaugă studii" onClick={() => openModal("education")} />}
          </ProfileSection>

          <ProfileSection title="Experiență & internship-uri" icon={<BriefcaseBusiness className="h-5 w-5 text-[#0e5e6f]" />} onAdd={() => openModal("experience")}>
            {experiences.length ? <div className="space-y-5">{experiences.map((experience) => <Entry key={experience.id} onEdit={() => openModal("experience", experience)} onDelete={() => deleteEntry(() => deleteExperience(experience.id), "Experiența a fost ștearsă.")}><div><h3 className="font-bold text-slate-900">{experience.position_title}</h3><p className="text-sm text-slate-600">{experience.company_name}{experience.location ? ` · ${experience.location}` : ""}</p><p className="mt-1 text-sm text-slate-500">{formatDate(experience.start_date)} – {experience.is_current ? "Prezent" : formatDate(experience.end_date)}</p>{experience.description ? <p className="mt-2 text-sm leading-6 text-slate-700">{experience.description}</p> : null}</div></Entry>)}</div> : <AddSection label="Adaugă o funcție sau un internship" onClick={() => openModal("experience")} />}
          </ProfileSection>

          <ProfileSection title={`Competențe (${skills.length})`} icon={<CheckCircle2 className="h-5 w-5 text-[#0e5e6f]" />} onAdd={() => openModal("skill")}>
            {skills.length ? <div className="flex flex-wrap gap-2">{skills.map((skill) => <span key={skill.id} className="inline-flex items-center gap-1 rounded-full bg-[#e5f4f6] px-3 py-1.5 text-sm font-semibold text-[#003747]">{skill.name} · {skillLevelLabel(skill.level)}<button type="button" onClick={() => openModal("skill", skill)} className="rounded p-0.5 hover:bg-white" aria-label={`Editează ${skill.name}`}><Pencil className="h-3.5 w-3.5" /></button><button type="button" onClick={() => deleteEntry(() => deleteSkill(skill.id), "Competența a fost ștearsă.")} className="rounded p-0.5 hover:bg-white" aria-label={`Șterge ${skill.name}`}><X className="h-3.5 w-3.5" /></button></span>)}</div> : <AddSection label="Adaugă aptitudini" onClick={() => openModal("skill")} />}
          </ProfileSection>

          <ProfileSection title="Licențe și atestări" icon={<ShieldCheck className="h-5 w-5 text-[#0e5e6f]" />} onAdd={() => openModal("certificate")}>
            {certificates.length ? <div className="space-y-5">{certificates.map((certificate) => <Entry key={certificate.id} onEdit={() => openModal("certificate", certificate)} onDelete={() => deleteEntry(() => deleteCertificate(certificate.id), "Atestarea a fost ștearsă.")}><div><h3 className="font-bold text-slate-900">{certificate.title}</h3><p className="text-sm text-slate-600">{certificate.issuing_organization}</p><p className="mt-1 text-sm text-slate-500">Emis la {formatDate(certificate.issue_date)}</p></div></Entry>)}</div> : <AddSection label="Adaugă o licență sau o atestare" onClick={() => openModal("certificate")} />}
          </ProfileSection>

          <ProfileSection title="Proiecte" icon={<ImagePlus className="h-5 w-5 text-[#0e5e6f]" />} onAdd={() => openModal("project")}>
            {projects.length ? <div className="space-y-5">{projects.map((project) => <Entry key={project.id} onEdit={() => openModal("project", project)} onDelete={() => deleteEntry(() => deleteProject(project.id), "Proiectul a fost șters.")}><div><h3 className="font-bold text-slate-900">{project.title}</h3>{project.description ? <p className="mt-1 text-sm leading-6 text-slate-700">{project.description}</p> : null}{project.technologies?.length ? <p className="mt-2 text-xs font-semibold text-[#0e5e6f]">{project.technologies.join(" · ")}</p> : null}</div></Entry>)}</div> : <AddSection label="Adaugă un proiect" onClick={() => openModal("project")} />}
          </ProfileSection>

          <ProfileSection title="Recomandări" icon={<CheckCircle2 className="h-5 w-5 text-[#0e5e6f]" />} onAdd={() => openModal("recommendation")}>
            {recommendations.length ? <div className="space-y-4">{recommendations.map((recommendation) => <Entry key={recommendation.id} onEdit={() => openModal("recommendation", recommendation)} onDelete={() => deleteEntry(() => deleteRecommendationRequest(recommendation.id), "Cererea de recomandare a fost ștearsă.")}><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">{recommendation.recipient_name}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{recommendationStatus(recommendation.status)}</span></div><p className="text-sm text-slate-600">{recommendation.relationship || "Persoană de contact"}</p><p className="mt-1 text-sm text-slate-500">Cererea este păstrată privat în EduLink.</p></div></Entry>)}</div> : <AddSection label="Solicită o recomandare" onClick={() => openModal("recommendation")} />}
          </ProfileSection>
        </section>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-900">CV și portofoliu</p><p className="mt-2 text-sm leading-6 text-slate-600">Completează profilul înainte de generare, pentru rezultate mai bune.</p><Link href="/dashboard/student/ai-hub?intent=cv" className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#026a81] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#003747]"><Sparkles className="h-4 w-4" />Generează CV</Link><Link href="/dashboard/student/ai-hub?intent=portfolio" className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[#0e5e6f] px-4 py-2.5 text-sm font-bold text-[#0e5e6f] hover:bg-[#e5f4f6]"><ExternalLink className="h-4 w-4" />Generează portofoliu</Link></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="font-bold text-slate-900">Profil public și adresă URL</p><p className="mt-2 break-all text-sm text-slate-500">{portfolioUrl ?? "Linkul public va fi creat la finalizarea profilului."}</p>{portfolioUrl && profile.qr_code_slug ? <><div className="mt-4 flex items-center gap-3 rounded-xl bg-[#f5f8f9] p-3"><img src={`/api/qr?slug=${encodeURIComponent(profile.qr_code_slug)}`} alt="Cod QR pentru portofoliul public" className="h-20 w-20 rounded-lg bg-white p-1" /><div><p className="inline-flex items-center gap-1 text-sm font-bold text-[#003747]"><QrCode className="h-4 w-4" />Cod QR pentru profil</p><a href={`/api/qr?slug=${encodeURIComponent(profile.qr_code_slug)}`} download="edulink-profil-qr.svg" className="mt-2 inline-flex text-xs font-bold text-[#026a81] hover:underline">Descarcă codul QR</a></div></div><Link href={portfolioUrl} target="_blank" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#026a81] hover:underline"><ExternalLink className="h-4 w-4" />Previzualizează profilul public</Link><Link href="/dashboard/student/portfolio" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#026a81] hover:underline"><Pencil className="h-4 w-4" />Editează portofoliul</Link></> : null}</section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="font-bold text-slate-900">Urmărește organizații</p><p className="mt-2 text-sm leading-6 text-slate-600">Găsește instituții și companii relevante în feed, apoi apasă „Urmărește”.</p><Link href="/feed" className="mt-4 inline-flex text-sm font-bold text-[#026a81] hover:underline">Mergi la recomandări</Link></section>
        </aside>
      </div>
      {modal ? <ProfileModal kind={modal} selected={selected} onClose={() => setModal(null)} /> : null}
    </main>
  );
}

function BasicEditor({ draft, pending, onChange, onSave }: { draft: { fullName: string; headline: string; location: string; bio: string; desiredJobs: string }; pending: boolean; onChange: (value: { fullName: string; headline: string; location: string; bio: string; desiredJobs: string }) => void; onSave: () => void }) {
  return <section className="rounded-2xl border border-[#0e5e6f]/20 bg-white p-5 shadow-sm sm:p-7"><div className="mb-5 flex items-center gap-2"><Pencil className="h-5 w-5 text-[#0e5e6f]" /><h2 className="text-lg font-extrabold text-slate-900">Editează informațiile de bază</h2></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Nume complet *"><input value={draft.fullName} onChange={(event) => onChange({ ...draft, fullName: event.target.value })} className={inputClass} /></Field><Field label="Titlu dorit / preferință job"><input value={draft.headline} onChange={(event) => onChange({ ...draft, headline: event.target.value })} placeholder="Ex.: Frontend Developer Intern" className={inputClass} /></Field></div><div className="mt-4"><Field label="Preferințe job (1–3, separate prin virgulă)"><input value={draft.desiredJobs} onChange={(event) => onChange({ ...draft, desiredJobs: event.target.value })} placeholder="Ex.: Frontend Developer, Data Analyst" className={inputClass} /></Field></div><div className="mt-4"><Field label="Locație"><input value={draft.location} onChange={(event) => onChange({ ...draft, location: event.target.value })} placeholder="Ex.: Chișinău, Moldova" className={inputClass} /></Field></div><div className="mt-4"><Field label="Despre mine"><textarea value={draft.bio} onChange={(event) => onChange({ ...draft, bio: event.target.value })} placeholder="Spune pe scurt ce te interesează și ce îți dorești să înveți." maxLength={2600} className={`${inputClass} min-h-32 resize-y`} /><p className="mt-1 text-right text-xs text-slate-400">{draft.bio.length}/2600</p></Field></div><div className="mt-5 flex justify-end"><button type="button" disabled={pending} onClick={onSave} className="inline-flex items-center gap-2 rounded-lg bg-[#026a81] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#003747] disabled:cursor-not-allowed disabled:opacity-70">{pending ? "Se salvează..." : <><Save className="h-4 w-4" />Salvează modificările</>}</button></div></section>;
}

function ProfileModal({ kind, selected, onClose }: { kind: ModalKind; selected: Selectable; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const education = kind === "education" ? selected as Education | null : null;
  const experience = kind === "experience" ? selected as Experience | null : null;
  const skill = kind === "skill" ? selected as Skill | null : null;
  const project = kind === "project" ? selected as Project | null : null;
  const certificate = kind === "certificate" ? selected as Certificate | null : null;
  const recommendation = kind === "recommendation" ? selected as Recommendation | null : null;
  const [form, setForm] = useState({ institutionName: education?.institution_name ?? "", degree: education?.degree ?? "licenta", fieldOfStudy: education?.field_of_study ?? "", startDate: education?.start_date ?? "", endDate: education?.end_date ?? "", isCurrent: education?.is_current || experience?.is_current ? "true" : "false", positionTitle: experience?.position_title ?? "", companyName: experience?.company_name ?? "", location: experience?.location ?? "", workMode: experience?.work_mode ?? "", jobType: experience?.job_type ?? "", description: experience?.description ?? "", name: skill?.name ?? "", level: skill?.level ?? "incepator", title: project?.title ?? certificate?.title ?? "", technologies: project?.technologies?.join(", ") ?? "", githubUrl: project?.github_url ?? "", liveDemoUrl: project?.live_demo_url ?? "", imageUrl: project?.image_url ?? "", organization: certificate?.issuing_organization ?? "", issueDate: certificate?.issue_date ?? "", expiryDate: certificate?.expiry_date ?? "", credentialUrl: certificate?.credential_url ?? "", recipientName: recommendation?.recipient_name ?? "", recipientEmail: recommendation?.recipient_email ?? "", relationship: recommendation?.relationship ?? "", message: recommendation?.message ?? "" });
  const set = (key: keyof typeof form, value: string) => setForm((previous) => ({ ...previous, [key]: value }));

  function submit() {
    startTransition(async () => {
      let result: ActionResult;
      if (kind === "education") result = await saveEducation({ id: education?.id, institutionName: form.institutionName, degree: form.degree as Education["degree"], fieldOfStudy: form.fieldOfStudy, startDate: form.startDate, endDate: form.endDate || null, isCurrent: form.isCurrent === "true" });
      else if (kind === "experience") result = await saveExperience({ id: experience?.id, positionTitle: form.positionTitle, companyName: form.companyName, location: form.location, workMode: form.workMode ? form.workMode as Experience["work_mode"] : null, jobType: form.jobType ? form.jobType as Experience["job_type"] : null, startDate: form.startDate, endDate: form.endDate || null, isCurrent: form.isCurrent === "true", description: form.description });
      else if (kind === "skill") result = await saveSkill({ id: skill?.id, name: form.name, level: form.level as Skill["level"] });
      else if (kind === "project") result = await saveProject({ id: project?.id, title: form.title, description: form.description, githubUrl: form.githubUrl, liveDemoUrl: form.liveDemoUrl, technologies: form.technologies.split(",").map((item) => item.trim()).filter(Boolean), imageUrl: form.imageUrl });
      else if (kind === "certificate") result = await saveCertificate({ id: certificate?.id, title: form.title, issuingOrganization: form.organization, issueDate: form.issueDate || null, expiryDate: form.expiryDate || null, credentialUrl: form.credentialUrl });
      else result = await saveRecommendationRequest({ id: recommendation?.id, recipientName: form.recipientName, recipientEmail: form.recipientEmail, relationship: form.relationship, message: form.message, sendEmail: true });
      if ("error" in result) { toast.error(result.error); return; }
      if (kind === "recommendation") {
        const subject = encodeURIComponent("Solicitare recomandare EduLink");
        const body = encodeURIComponent(form.message.trim() || "Bună ziua,\n\nVă rog să îmi oferiți o recomandare pentru profilul meu EduLink.\n\nVă mulțumesc!");
        toast.success("Cererea a fost salvată. Se deschide aplicația de e-mail.");
        onClose();
        window.location.assign(`mailto:${encodeURIComponent(form.recipientEmail)}?subject=${subject}&body=${body}`);
        return;
      }
      toast.success("Secțiunea a fost salvată.");
      onClose();
    });
  }

  const title = kind === "education" ? "Adaugă studii" : kind === "experience" ? "Adaugă experiență" : kind === "skill" ? "Adaugă aptitudini" : kind === "project" ? "Adaugă un proiect" : kind === "certificate" ? "Adaugă o licență sau o atestare" : "Solicită o recomandare";
  return <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4"><h2 className="text-lg font-extrabold text-slate-950">{title}</h2><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Închide"><X /></button></div><div className="space-y-4 p-6"><ModalFields kind={kind} form={form} set={set} /></div><div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4"><button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700">Anulează</button><button type="button" disabled={pending} onClick={submit} className="rounded-lg bg-[#026a81] px-5 py-2 text-sm font-bold text-white hover:bg-[#003747] disabled:opacity-70">{pending ? "Se salvează..." : "Salvează"}</button></div></div></div>;
}

function ModalFields({ kind, form, set }: { kind: ModalKind; form: Record<string, string>; set: (key: never, value: string) => void }) {
  const setValue = (key: string, value: string) => set(key as never, value);
  if (kind === "education") return <><Field label="Instituție de învățământ *"><input value={form.institutionName} onChange={(event) => setValue("institutionName", event.target.value)} placeholder="Ex.: Universitatea Tehnică a Moldovei" className={inputClass} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Diplomă"><select value={form.degree} onChange={(event) => setValue("degree", event.target.value)} className={inputClass}><option value="bacalaureat">Bacalaureat</option><option value="licenta">Licență</option><option value="master">Master</option><option value="doctorat">Doctorat</option><option value="bacalaureat_licenta">Bacalaureat + Licență</option></select></Field><Field label="Domeniu de studiu *"><input value={form.fieldOfStudy} onChange={(event) => setValue("fieldOfStudy", event.target.value)} placeholder="Ex.: Inginerie software" className={inputClass} /></Field></div><DateFields form={form} set={setValue} /></>;
  if (kind === "experience") return <><Field label="Titlu *"><input value={form.positionTitle} onChange={(event) => setValue("positionTitle", event.target.value)} placeholder="Ex.: Software Developer Intern" className={inputClass} /></Field><Field label="Companie sau organizație (opțional)"><input value={form.companyName} onChange={(event) => setValue("companyName", event.target.value)} placeholder="Ex.: Microsoft" className={inputClass} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Tip de angajare"><select value={form.jobType} onChange={(event) => setValue("jobType", event.target.value)} className={inputClass}><option value="">Selectează</option><option value="internship">Internship</option><option value="parttime">Part-time</option><option value="fulltime">Full-time</option><option value="volunteer">Voluntariat</option><option value="contract">Contract</option></select></Field><Field label="Tip locație"><select value={form.workMode} onChange={(event) => setValue("workMode", event.target.value)} className={inputClass}><option value="">Selectează</option><option value="onsite">La sediu</option><option value="hybrid">Hibrid</option><option value="remote">La distanță</option></select></Field></div><Field label="Locație"><input value={form.location} onChange={(event) => setValue("location", event.target.value)} placeholder="Ex.: Chișinău, Moldova" className={inputClass} /></Field><DateFields form={form} set={setValue} /><Field label="Descriere (opțional)"><textarea value={form.description} onChange={(event) => setValue("description", event.target.value)} className={`${inputClass} min-h-28`} maxLength={2000} /></Field></>;
  if (kind === "skill") return <div className="grid gap-4 sm:grid-cols-2"><Field label="Aptitudine *"><select value={form.name} onChange={(event) => setValue("name", event.target.value)} className={inputClass}><option value="">Alege aptitudinea</option>{MOCK_SKILLS.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></Field><Field label="Nivel"><select value={form.level} onChange={(event) => setValue("level", event.target.value)} className={inputClass}><option value="incepator">Începător</option><option value="intermediar">Intermediar</option><option value="avansat">Avansat</option></select></Field></div>;
  if (kind === "project") return <><Field label="Denumire proiect *"><input value={form.title} onChange={(event) => setValue("title", event.target.value)} className={inputClass} maxLength={255} /></Field><Field label="Descriere"><textarea value={form.description} onChange={(event) => setValue("description", event.target.value)} className={`${inputClass} min-h-28`} maxLength={2000} /></Field><Field label="Aptitudini / tehnologii"><input value={form.technologies} onChange={(event) => setValue("technologies", event.target.value)} placeholder="React, TypeScript, Figma" className={inputClass} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Link GitHub"><input value={form.githubUrl} onChange={(event) => setValue("githubUrl", event.target.value)} className={inputClass} inputMode="url" /></Field><Field label="Link demonstrație"><input value={form.liveDemoUrl} onChange={(event) => setValue("liveDemoUrl", event.target.value)} className={inputClass} inputMode="url" /></Field></div><Field label="Imagine proiect / link media"><input value={form.imageUrl} onChange={(event) => setValue("imageUrl", event.target.value)} placeholder="https://..." className={inputClass} inputMode="url" /></Field><MediaUploadField label="screenshot-ul proiectului" accept="image/png,image/jpeg,image/webp" onUploaded={(url) => setValue("imageUrl", url)} /></>;
  if (kind === "certificate") return <><Field label="Nume *"><input value={form.title} onChange={(event) => setValue("title", event.target.value)} placeholder="Ex.: Certificare Microsoft" className={inputClass} /></Field><Field label="Organizație emitentă *"><input value={form.organization} onChange={(event) => setValue("organization", event.target.value)} placeholder="Ex.: Microsoft" className={inputClass} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Data emiterii"><input type="date" value={form.issueDate} onChange={(event) => setValue("issueDate", event.target.value)} className={inputClass} /></Field><Field label="Data expirării"><input type="date" value={form.expiryDate} onChange={(event) => setValue("expiryDate", event.target.value)} className={inputClass} /></Field></div><Field label="URL acreditare sau media"><input value={form.credentialUrl} onChange={(event) => setValue("credentialUrl", event.target.value)} className={inputClass} inputMode="url" /></Field><MediaUploadField label="certificatul (imagine sau PDF)" accept="image/png,image/jpeg,image/webp,application/pdf" onUploaded={(url) => setValue("credentialUrl", url)} /></>;
  return <><p className="text-sm leading-6 text-slate-600">E-mailul rămâne privat. EduLink nu trimite încă mesajul automat și nu publică recomandarea fără acordul tău.</p><Field label="Nume persoană *"><input value={form.recipientName} onChange={(event) => setValue("recipientName", event.target.value)} className={inputClass} /></Field><Field label="E-mail persoană *"><input value={form.recipientEmail} onChange={(event) => setValue("recipientEmail", event.target.value)} className={inputClass} inputMode="email" /></Field><Field label="Relația cu tine"><input value={form.relationship} onChange={(event) => setValue("relationship", event.target.value)} placeholder="Ex.: profesor coordonator" className={inputClass} /></Field><Field label="Mesaj personal (opțional)"><textarea value={form.message} onChange={(event) => setValue("message", event.target.value)} className={`${inputClass} min-h-28`} maxLength={1500} /></Field></>;
}

function MediaUploadField({ label, accept, onUploaded }: { label: string; accept: string; onUploaded: (url: string) => void }) {
  const [uploading, startTransition] = useTransition();
  function upload(file: File | undefined) {
    if (!file) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadProfileMedia(formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      onUploaded(result.url);
      toast.success("Fișierul a fost încărcat și asociat cu această secțiune.");
    });
  }
  return <label className="block rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600"><span className="font-bold text-slate-800">Încarcă {label}</span><span className="mt-1 block text-xs">Maxim 10 MB. Fișierul poate fi accesat prin link public și va apărea în portofoliu numai după ce salvezi secțiunea.</span><input type="file" accept={accept} className="mt-3 block w-full text-sm" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} />{uploading ? <span className="mt-2 block text-xs font-bold text-[#0e5e6f]">Se încarcă fișierul...</span> : null}</label>;
}

function DateFields({ form, set }: { form: Record<string, string>; set: (key: string, value: string) => void }) { return <><button type="button" onClick={() => set("isCurrent", form.isCurrent === "true" ? "false" : "true")} className={`rounded-lg px-4 py-2 text-sm font-bold ${form.isCurrent === "true" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>{form.isCurrent === "true" ? "✓ Lucrez / studiez aici în prezent" : "Nu este în curs"}</button><div className="grid gap-4 sm:grid-cols-2"><Field label="Data începerii *"><input type="date" value={form.startDate} onChange={(event) => set("startDate", event.target.value)} className={inputClass} /></Field><Field label="Data finalizării"><input type="date" disabled={form.isCurrent === "true"} value={form.endDate} onChange={(event) => set("endDate", event.target.value)} className={inputClass} /></Field></div></>; }
function Entry({ children, onEdit, onDelete }: { children: ReactNode; onEdit: () => void; onDelete: () => void }) { return <div className="group flex gap-4 rounded-xl p-2 transition hover:bg-slate-50"><div className="flex min-w-0 flex-1 gap-3">{children}</div><div className="flex h-fit gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><button type="button" onClick={onEdit} className="rounded-lg p-2 text-[#0e5e6f] hover:bg-[#e5f4f6]" aria-label="Editează"><Pencil className="h-4 w-4" /></button><button type="button" onClick={onDelete} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Șterge"><Trash2 className="h-4 w-4" /></button></div></div>; }
function ProfileSection({ title, icon, children, onAdd, onEdit }: { title: string; icon: ReactNode; children: ReactNode; onAdd?: () => void; onEdit?: () => void }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="mb-5 flex items-center justify-between gap-4"><h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">{icon}{title}</h2>{onAdd || onEdit ? <button type="button" onClick={onAdd ?? onEdit} className="rounded-lg p-2 text-[#0e5e6f] hover:bg-[#e5f4f6]" aria-label={`Editează ${title}`}><Pencil className="h-4 w-4" /></button> : null}</div>{children}</section>; }
function AddSection({ label, onClick }: { label: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-600 transition hover:border-[#0e5e6f] hover:bg-[#e5f4f6] hover:text-[#0e5e6f]"><Plus className="h-4 w-4" />{label}</button>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-sm font-bold text-slate-800">{label}{children}</label>; }
function formatDate(value: string | null) { if (!value) return "—"; const [year, month, day] = value.split("-"); return year && month && day ? `${day}.${month}.${year}` : value; }
function initialsFor(name: string) { return name.split(" ").filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "EL"; }
function degreeLabel(value: Education["degree"]) { return { bacalaureat: "Bacalaureat", licenta: "Licență", master: "Master", doctorat: "Doctorat", bacalaureat_licenta: "Bacalaureat + Licență" }[value]; }
function skillLevelLabel(value: Skill["level"]) { return { incepator: "Începător", intermediar: "Intermediar", avansat: "Avansat" }[value]; }
function recommendationStatus(value: Recommendation["status"]) { return { draft: "Pregătită", requested: "Trimisă", received: "Primită", declined: "Refuzată" }[value]; }
function deleteEntry(action: () => Promise<ActionResult>, successMessage: string) { if (!window.confirm("Ești sigur(ă) că dorești să ștergi această secțiune?")) return; void action().then((result) => { if ("error" in result) toast.error(result.error); else toast.success(successMessage); }); }
const inputClass = "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#026a81] focus:ring-4 focus:ring-[#026a81]/10 disabled:bg-slate-100";
