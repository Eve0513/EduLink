import { z } from "zod";

/** Confirmed student data supplied to the CV generator. */
export interface EduLinkProfile {
  full_name: string;
  headline: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  personal_website_url?: string | null;
  portfolio_slug?: string | null;
}

export interface EduLinkEducation {
  degree_level: string;
  field_of_study: string;
  institution_name: string;
  start_date: string;
  end_date: string | null;
}

export interface EduLinkExperience {
  employment_type: string;
  job_title: string;
  organization_name: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  description: string;
}

export interface EduLinkProject {
  title: string;
  description: string;
  technologies: string[];
  repo_url: string | null;
  live_url: string | null;
}

export interface EduLinkCertificate {
  title: string;
  issuing_organization: string;
  date_issued: string;
  credential_id: string | null;
  is_verified: boolean;
}

export interface EduLinkSkill {
  name: string;
  level: "Începător" | "Intermediar" | "Avansat";
}

export interface CVGenerationInput {
  language: "ro" | "en";
  profile: EduLinkProfile;
  educations: EduLinkEducation[];
  experiences: EduLinkExperience[];
  projects: EduLinkProject[];
  certificates: EduLinkCertificate[];
  skills: EduLinkSkill[];
}

const nullableText = z.string().nullable();
const skillLevelSchema = z.enum(["Începător", "Intermediar", "Avansat"]);

export const GeneratedCVSchema = z
  .object({
    language: z.enum(["ro", "en"]),
    target_role_inferred: z.string().min(1).max(160),
    contact: z
      .object({
        full_name: z.string().min(1).max(160),
        email: nullableText,
        phone: nullableText,
        location: nullableText,
        contact_link: nullableText,
      })
      .strict(),
    professional_summary: z.string().max(900),
    education: z.array(
      z
        .object({
          degree_level: z.string(),
          field_of_study: z.string(),
          institution_name: z.string(),
          start_date: z.string(),
          end_date: nullableText,
        })
        .strict(),
    ),
    experience: z.array(
      z
        .object({
          job_title: z.string(),
          organization_name: nullableText,
          employment_type: z.string(),
          location: nullableText,
          start_date: z.string(),
          end_date: nullableText,
          bullets: z.array(z.string().max(260)).max(5),
        })
        .strict(),
    ),
    projects: z.array(
      z
        .object({
          title: z.string(),
          description_bullets: z.array(z.string().max(260)).max(5),
          technologies: z.array(z.string()),
          repo_url: nullableText,
          live_url: nullableText,
        })
        .strict(),
    ),
    certificates: z.array(
      z
        .object({
          title: z.string(),
          issuing_organization: z.string(),
          date_issued: z.string(),
          credential_id: nullableText,
          is_verified: z.boolean(),
          relevance_note: nullableText,
        })
        .strict(),
    ),
    skills: z.array(z.object({ name: z.string(), level: skillLevelSchema }).strict()),
    ats_report: z
      .object({
        score: z.number().min(0).max(100),
        score_breakdown: z
          .object({
            keyword_alignment: z.number().min(0).max(100),
            structure_and_formatting: z.number().min(0).max(100),
            quantifiable_impact: z.number().min(0).max(100),
            action_verb_usage: z.number().min(0).max(100),
          })
          .strict(),
        missing_or_weak_areas: z.array(z.string()),
        improvement_suggestions: z.array(z.string()).length(3),
      })
      .strict(),
  })
  .strict();

export type GeneratedCV = z.infer<typeof GeneratedCVSchema>;

const splitIntoBullets = (value: string) =>
  value
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((item) => item.slice(0, 260));

/**
 * A deterministic, truthful fallback. A provider outage must not stop the
 * student from downloading a CV built from their own confirmed profile.
 */
export function buildFallbackCV(input: CVGenerationInput): GeneratedCV {
  const summary =
    input.profile.bio?.trim() ||
    input.profile.headline?.trim() ||
    (input.language === "ro"
      ? "Profil EduLink bazat exclusiv pe informațiile confirmate de student."
      : "EduLink profile based exclusively on student-confirmed information.");
  const score = Math.min(
    100,
    35 +
      (input.educations.length > 0 ? 20 : 0) +
      (input.experiences.length > 0 ? 20 : 0) +
      (input.projects.length > 0 ? 15 : 0) +
      Math.min(input.skills.length, 5) * 2,
  );
  const suggestions =
    input.language === "ro"
      ? [
          "Completează descrierile experiențelor cu responsabilități reale.",
          "Adaugă proiecte și certificate numai dacă le poți verifica.",
          "Revizuiește datele de contact și perioadele înainte de trimitere.",
        ]
      : [
          "Complete experience descriptions with real responsibilities.",
          "Add projects and certificates only when they can be verified.",
          "Review contact details and dates before sending the CV.",
        ];

  return {
    language: input.language,
    target_role_inferred: input.profile.headline?.trim() || (input.language === "ro" ? "Student" : "Student"),
    contact: {
      full_name: input.profile.full_name,
      email: input.profile.email,
      phone: input.profile.phone,
      location: input.profile.location,
      contact_link: input.profile.portfolio_slug ? `/portofoliu/${input.profile.portfolio_slug}` : null,
    },
    professional_summary: summary.slice(0, 900),
    education: input.educations.map((item) => ({ ...item })),
    experience: input.experiences.map((item) => ({
      job_title: item.job_title,
      organization_name: item.organization_name,
      employment_type: item.employment_type,
      location: item.location,
      start_date: item.start_date,
      end_date: item.end_date,
      bullets: splitIntoBullets(item.description),
    })),
    projects: input.projects.map((item) => ({
      title: item.title,
      description_bullets: splitIntoBullets(item.description),
      technologies: item.technologies,
      repo_url: item.repo_url,
      live_url: item.live_url,
    })),
    certificates: input.certificates.map((item) => ({ ...item, relevance_note: null })),
    skills: input.skills.map((item) => ({ ...item })),
    ats_report: {
      score,
      score_breakdown: {
        keyword_alignment: input.skills.length > 0 ? 60 : 20,
        structure_and_formatting: input.educations.length > 0 || input.experiences.length > 0 ? 70 : 30,
        quantifiable_impact: 20,
        action_verb_usage: input.experiences.length > 0 || input.projects.length > 0 ? 55 : 20,
      },
      missing_or_weak_areas: [],
      improvement_suggestions: suggestions,
    },
  };
}

export const CV_GENERATION_SYSTEM_PROMPT = `
Ești editorul de CV al EduLink. Creezi un CV ATS clar, complet și ușor de citit.

REGULĂ ABSOLUTĂ: folosești exclusiv informațiile din JSON-ul primit. Poți corecta
gramatica și poți transforma descrieri în bullet-uri, însă nu inventezi companii,
roluri, tehnologii, certificate, rezultate, cifre, procente, date sau linkuri.
Păstrezi exact perioadele, numele organizațiilor și statutul de verificare primit.

COMPLETITATE:
- Include fiecare educație, experiență, proiect, certificat și competență nevidă.
- Preserve all distinct factual details from the profile biography and each
  experience/project description. Do not reduce a detailed biography to a
  generic one-sentence summary. When the supplied biography contains at least
  350 characters, the professional_summary should normally retain 350-800
  characters of its factual content, written clearly and without repetition.
- Pentru fiecare experiență și proiect, creează 1-5 bullet-uri doar din descrierea
  furnizată. Dacă descrierea nu conține suficiente fapte, folosește mai puține
  bullet-uri; nu completa golurile cu presupuneri.
- Rezumatul profesional are 3-5 propoziții doar când datele permit. Altfel este
  un rezumat scurt și prudent al profilului, studiilor și intereselor confirmate.
- Rolul țintă se bazează în primul rând pe headline. Dacă acesta lipsește, alege o
  formulare prudentă din competențele și proiectele deja existente; nu pretinde o
  calificare care nu apare în date.
- Nu elimina linkurile, tehnologiile, credential_id-urile sau datele ne-goale.

LIMBĂ ȘI FORMAT:
- Scrie toate textele redactate în limba câmpului language (ro sau en).
- Pentru română, folosește diacritice corecte: ă, â, î, ș, ț.
- Text simplu, fără Markdown, emoji sau caractere de listă în valorile string.
- Bullet-urile încep cu un verb de acțiune numai când acest lucru rămâne fidel
  informației oferite și au maximum 260 de caractere.

ATS:
- Calculează ats_report doar pentru interfața EduLink. Acesta NU este parte din
  documentul PDF descărcat.
- Oferă exact trei sugestii acționabile, fără recomandări care pretind fapte noi.

Răspunde exclusiv cu obiectul JSON care respectă schema. Fără explicații și fără
blocuri de cod.
`.trim();

export const CV_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["language", "target_role_inferred", "contact", "professional_summary", "education", "experience", "projects", "certificates", "skills", "ats_report"],
  properties: {
    language: { type: "string", enum: ["ro", "en"] },
    target_role_inferred: { type: "string" },
    contact: {
      type: "object",
      additionalProperties: false,
      required: ["full_name", "email", "phone", "location", "contact_link"],
      properties: {
        full_name: { type: "string" },
        email: { type: ["string", "null"] },
        phone: { type: ["string", "null"] },
        location: { type: ["string", "null"] },
        contact_link: { type: ["string", "null"] },
      },
    },
    professional_summary: { type: "string" },
    education: { type: "array", items: { type: "object", additionalProperties: false, required: ["degree_level", "field_of_study", "institution_name", "start_date", "end_date"], properties: { degree_level: { type: "string" }, field_of_study: { type: "string" }, institution_name: { type: "string" }, start_date: { type: "string" }, end_date: { type: ["string", "null"] } } } },
    experience: { type: "array", items: { type: "object", additionalProperties: false, required: ["job_title", "organization_name", "employment_type", "location", "start_date", "end_date", "bullets"], properties: { job_title: { type: "string" }, organization_name: { type: ["string", "null"] }, employment_type: { type: "string" }, location: { type: ["string", "null"] }, start_date: { type: "string" }, end_date: { type: ["string", "null"] }, bullets: { type: "array", items: { type: "string" }, maxItems: 5 } } } },
    projects: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "description_bullets", "technologies", "repo_url", "live_url"], properties: { title: { type: "string" }, description_bullets: { type: "array", items: { type: "string" }, maxItems: 5 }, technologies: { type: "array", items: { type: "string" } }, repo_url: { type: ["string", "null"] }, live_url: { type: ["string", "null"] } } } },
    certificates: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "issuing_organization", "date_issued", "credential_id", "is_verified", "relevance_note"], properties: { title: { type: "string" }, issuing_organization: { type: "string" }, date_issued: { type: "string" }, credential_id: { type: ["string", "null"] }, is_verified: { type: "boolean" }, relevance_note: { type: ["string", "null"] } } } },
    skills: { type: "array", items: { type: "object", additionalProperties: false, required: ["name", "level"], properties: { name: { type: "string" }, level: { type: "string", enum: ["Începător", "Intermediar", "Avansat"] } } } },
    ats_report: { type: "object", additionalProperties: false, required: ["score", "score_breakdown", "missing_or_weak_areas", "improvement_suggestions"], properties: { score: { type: "number", minimum: 0, maximum: 100 }, score_breakdown: { type: "object", additionalProperties: false, required: ["keyword_alignment", "structure_and_formatting", "quantifiable_impact", "action_verb_usage"], properties: { keyword_alignment: { type: "number", minimum: 0, maximum: 100 }, structure_and_formatting: { type: "number", minimum: 0, maximum: 100 }, quantifiable_impact: { type: "number", minimum: 0, maximum: 100 }, action_verb_usage: { type: "number", minimum: 0, maximum: 100 } } }, missing_or_weak_areas: { type: "array", items: { type: "string" } }, improvement_suggestions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 } } },
  },
} as const;

export function buildCVGenerationUserMessage(input: CVGenerationInput): string {
  return [
    "Generează CV-ul folosind exclusiv datele confirmate de mai jos.",
    "Include toate înregistrările ne-goale și nu adăuga informații inexistente.",
    JSON.stringify(input),
  ].join("\n\n");
}
