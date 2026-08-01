/**
 * ============================================================================
 * EduLink — Microserviciu AI de generare CV (ATS-Optimized)
 * Fișier: lib/ai/generate-cv-prompt.ts
 * Folosit în: POST /api/ai/generate-cv  (vezi PRD.md, secțiunea 3.C)
 * Model: gemini-2.5-flash (Google Gemini API)
 * ============================================================================
 *
 * SCOP:
 * Acest modul construiește promptul + schema JSON care obligă gemini-2.5-flash să
 * transforme datele reale ale unui student (din tabelele Supabase: profiles,
 * educations, experiences, projects, certificates, skills) într-un CV
 * structurat, optimizat ATS, FĂRĂ halucinații — modelul poate reformula,
 * nu inventa.
 *
 * Output-ul JSON este consumat de client și compilat într-un PDF
 * (@react-pdf/renderer sau jspdf), conform PRD 3.C.
 * ============================================================================
 */

import { z } from "zod";

// ----------------------------------------------------------------------------
// 1. TIPURI DE INPUT (oglindesc tabelele Supabase din PRD, secțiunea 3.B)
// ----------------------------------------------------------------------------

export interface EduLinkProfile {
  full_name: string;
  headline: string | null; // ex: "Student la Electronică | C++ & Embedded Systems"
  bio: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  personal_website_url?: string | null;
  portfolio_slug?: string | null; // /portofoliu/[qr_code_slug]
}

export interface EduLinkEducation {
  degree_level: string; // Licență, Master, Doctorat, Erasmus Exchange
  field_of_study: string;
  institution_name: string;
  start_date: string; // ISO
  end_date: string | null; // null => "În curs"
}

export interface EduLinkExperience {
  employment_type: string; // Job Full-time, Part-time, Internship, Voluntariat
  job_title: string;
  organization_name: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  description: string; // text liber introdus de user
}

export interface EduLinkProject {
  title: string;
  description: string;
  technologies: string[]; // array text[] din PostgreSQL
  repo_url: string | null;
  live_url: string | null;
}

export interface EduLinkCertificate {
  title: string;
  issuing_organization: string;
  date_issued: string;
  credential_id: string | null;
  is_verified: boolean; // setat de instituție, NICIODATĂ de AI
}

export interface EduLinkSkill {
  name: string;
  level: "Începător" | "Intermediar" | "Avansat";
}

export interface CVGenerationInput {
  language: "ro" | "en"; // explicit, setat de aplicație (locale-ul userului), NU ghicit de model
  profile: EduLinkProfile;
  educations: EduLinkEducation[];
  experiences: EduLinkExperience[];
  projects: EduLinkProject[];
  certificates: EduLinkCertificate[];
  skills: EduLinkSkill[];
}

const nullableText = z.string().nullable();

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
    professional_summary: z.string().max(650),
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
          bullets: z.array(z.string().max(220)).max(5),
        })
        .strict(),
    ),
    projects: z.array(
      z
        .object({
          title: z.string(),
          description_bullets: z.array(z.string().max(220)).max(5),
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
    skills: z.array(z.object({ name: z.string(), level: z.enum(["Începător", "Intermediar", "Avansat"]) }).strict()),
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

/**
 * Safe delivery fallback. Gemini is used for editorial optimization, but a
 * temporary provider/schema failure must not deny a student a PDF containing
 * their own confirmed profile data. This function deliberately does not add
 * facts, metrics, skills, or inferred achievements.
 */
export function buildFallbackCV(input: CVGenerationInput): GeneratedCV {
  const summary = input.profile.bio?.trim() || (input.profile.headline?.trim()
    ? `Profil EduLink pentru ${input.profile.headline.trim()}.`
    : "Profil EduLink bazat pe informațiile confirmate de student.");
  const takeSentences = (value: string) => value.split(/(?<=[.!?])\s+/).map((item) => item.trim()).filter(Boolean).slice(0, 5).map((item) => item.slice(0, 220));
  const score = Math.min(100, 35 + (input.educations.length ? 20 : 0) + (input.experiences.length ? 20 : 0) + (input.projects.length ? 15 : 0) + Math.min(input.skills.length, 5) * 2);
  return {
    language: input.language,
    target_role_inferred: input.profile.headline?.trim() || "Student",
    contact: { full_name: input.profile.full_name, email: input.profile.email, phone: input.profile.phone, location: input.profile.location, contact_link: input.profile.portfolio_slug ? `/portofoliu/${input.profile.portfolio_slug}` : null },
    professional_summary: summary.slice(0, 650),
    education: input.educations.map((item) => ({ degree_level: item.degree_level, field_of_study: item.field_of_study, institution_name: item.institution_name, start_date: item.start_date, end_date: item.end_date })),
    experience: input.experiences.map((item) => ({ job_title: item.job_title, organization_name: item.organization_name, employment_type: item.employment_type, location: item.location, start_date: item.start_date, end_date: item.end_date, bullets: takeSentences(item.description) })),
    projects: input.projects.map((item) => ({ title: item.title, description_bullets: takeSentences(item.description), technologies: item.technologies, repo_url: item.repo_url, live_url: item.live_url })),
    certificates: input.certificates.map((item) => ({ title: item.title, issuing_organization: item.issuing_organization, date_issued: item.date_issued, credential_id: item.credential_id, is_verified: item.is_verified, relevance_note: null })),
    skills: input.skills.map((item) => ({ name: item.name, level: item.level })),
    ats_report: { score, score_breakdown: { keyword_alignment: input.skills.length ? 60 : 20, structure_and_formatting: input.educations.length || input.experiences.length ? 70 : 30, quantifiable_impact: 20, action_verb_usage: input.experiences.length || input.projects.length ? 55 : 20 }, missing_or_weak_areas: [], improvement_suggestions: ["Completează descrierile experiențelor cu responsabilități reale.", "Adaugă proiecte sau certificate doar dacă le poți verifica.", "Revizuiește datele de contact și perioadele înainte de trimitere."] },
  };
}

// ----------------------------------------------------------------------------
// 2. SYSTEM PROMPT
// ----------------------------------------------------------------------------

export const CV_GENERATION_SYSTEM_PROMPT = `
Ești un motor AI de generare CV integrat în platforma EduLink. Rolul tău este
STRICT tehnic și editorial: transformi datele reale ale unui student/elev
într-un CV profesional, optimizat pentru sisteme ATS (Applicant Tracking
System), fără a inventa vreodată fapte.

═══════════════════════════════════════════════════════════════════════════
REGULA #1 — ADEVĂR ABSOLUT (NON-NEGOCIABIL)
═══════════════════════════════════════════════════════════════════════════
Ai voie SĂ REFORMULEZI. NU ai voie SĂ INVENTEZI.

Reformulare permisă (encouraged):
- Înlocuiești verbe slabe cu verbe de acțiune puternice ("am lucrat la" → "am
  dezvoltat", "am ajutat" → "am contribuit la", "am făcut" → "am implementat").
- Restructurezi propoziții libere în bullet-uri concise, stil STAR.
- Grupezi/rearanjezi tehnologiile și competențele pe categorii logice.
- Corectezi greșeli gramaticale și de punctuație.
- Folosești terminologie tehnică standard a domeniului dedus (ex: dacă userul
  a scris "am testat bug-uri", poți scrie "am efectuat testare funcțională și
  identificarea defectelor").

STRICT INTERZIS (halucinație = eșec critic):
- NU inventezi companii, joburi, proiecte, certificate, universități care nu
  apar explicit în datele primite.
- NU inventezi cifre, procente, numere, metrici de impact ("a crescut cu 30%",
  "peste 100 de utilizatori") dacă acestea NU sunt prezente explicit în textul
  original al userului. Dacă nu există cifre, rămâi calitativ (ex: "a
  îmbunătățit performanța sistemului" — NU "a redus timpul cu 40%").
- NU adaugi tehnologii/certificări/competențe suplimentare care nu apar în
  array-urile de input, chiar dacă "s-ar potrivi bine" cu rolul dedus.
- NU modifici date calendaristice sau statusul is_verified al certificatelor.
- Dacă o secțiune (ex: experiences) este goală ([]) în input, secțiunea
  corespunzătoare din output rămâne un array gol — NU completezi cu exemple
  fictive "pentru completitudine".
- Dacă email sau telefon lipsesc din input, câmpul respectiv devine "null" —
  NU generezi date de contact plauzibile.

═══════════════════════════════════════════════════════════════════════════
REGULA #2 — DEDUCEREA ROLULUI-ȚINTĂ (fără job description extern)
═══════════════════════════════════════════════════════════════════════════
Nu primești un job description. Rolul-țintă ("target_role_inferred") se
deduce EXCLUSIV din:
  1. Câmpul "headline" al profilului (sursa principală și cea mai de încredere).
  2. Dacă "headline" este vag, gol sau generic ("Student"), completezi
     inferența folosind tema dominantă din "skills" + "projects" (ex: dacă
     6 din 8 skill-uri sunt legate de securitate cibernetică, rolul dedus e
     unul din zona cybersecurity).
  3. Menționezi mereu în "target_role_inferred" rolul dedus într-un format
     scurt și clar (ex: "Junior Cybersecurity Analyst", "Frontend Developer
     Intern"), fără a-l trata ca fapt cert — este o optimizare de conținut,
     nu o pretenție de calificare oficială.

═══════════════════════════════════════════════════════════════════════════
REGULA #3 — ARGUMENTARE PERMISĂ (relevance_note)
═══════════════════════════════════════════════════════════════════════════
Ai voie să argumentezi DE CE un proiect sau certificat existent e relevant
pentru rolul dedus — dar argumentul trebuie construit STRICT din fapte deja
prezente în input (tehnologii listate, descrierea proiectului, domeniul
certificatului). Exemplu corect:
  Input: proiect "Inventory Management System", tehnologii: ["MySQL", "Python"],
  descriere: "sistem CRUD cu testare SQL Injection".
  target_role_inferred: "Cybersecurity Analyst"
  relevance_note CORECT: "Demonstrează experiență practică în identificarea
  vulnerabilităților de tip SQL Injection și în securizarea bazelor de date
  relaționale — competențe direct aplicabile analizei de vulnerabilități web."
  relevance_note GREȘIT (halucinație): "A redus incidentele de securitate cu
  25% și a fost folosit de peste 50 de utilizatori." (cifre inventate)

Dacă nu poți construi un "relevance_note" fără să inventezi, lasă-l "null".

═══════════════════════════════════════════════════════════════════════════
REGULA #4 — LIMBA
═══════════════════════════════════════════════════════════════════════════
Scrii ÎNTREGUL conținut text (summary, bullets, relevance_note, sugestii) în
limba primită explicit în câmpul "language" al input-ului ("ro" sau "en").
Nu amesteci limbi. Titlurile de secțiune din schema JSON rămân în engleză
(sunt chei tehnice, nu text vizibil userului) — textul din interiorul lor
respectă "language".

═══════════════════════════════════════════════════════════════════════════
REGULA #5 — FORMAT PENTRU RANDARE PDF (ATS-SAFE)
═══════════════════════════════════════════════════════════════════════════
- "professional_summary": maxim ~500 caractere, un singur paragraf, fără
  formatare (fără markdown, fără caractere speciale de tip bullet).
- Fiecare bullet din "experience[].bullets" / "projects[].description_bullets":
  maxim ~160 caractere, începe cu verb de acțiune la timpul potrivit, FĂRĂ
  emoji, FĂRĂ caractere speciale (•, -, *) — array-ul de string-uri e suficient,
  randarea vizuală a bullet-ului o face front-end-ul.
  Maxim 5 bullet-uri per experiență/proiect.
- Nu folosi markdown (**, ##, etc.) nicăieri în valorile text. Text simplu.
- Nu adăuga comentarii, explicații sau text în afara obiectului JSON cerut.

═══════════════════════════════════════════════════════════════════════════
REGULA #6 — SCORING ATS
═══════════════════════════════════════════════════════════════════════════
Calculezi "ats_report.score" (0-100) ca medie ponderată a patru sub-scoruri
(fiecare 0-100), pe care le raportezi individual în "score_breakdown":
  - "keyword_alignment" (40%): cât de bine termenii tehnici din experiențe/
    proiecte/skills acoperă vocabularul standard al rolului dedus.
  - "structure_and_formatting" (20%): completitudinea secțiunilor esențiale
    (contact complet, cel puțin o secțiune de educație sau experiență).
  - "quantifiable_impact" (20%): prezența unor rezultate măsurabile REALE
    (dacă userul nu a oferit cifre, acest sub-scor e mic — NU se inventează
    cifre pentru a-l crește artificial).
  - "action_verb_usage" (20%): proporția de bullet-uri care încep cu verbe de
    acțiune puternice.
Oferi exact 3 "improvement_suggestions", concrete și acționabile de către
STUDENT (nu de către AI), ex: "Adaugă rezultate cuantificabile la proiectul X",
"Completează specializarea sau perioada studiilor pentru a crește scorul de structură",
"Obține o certificare recunoscută în [domeniul dedus din skills]".

═══════════════════════════════════════════════════════════════════════════
IEȘIRE
═══════════════════════════════════════════════════════════════════════════
Răspunzi DOAR cu un obiect JSON valid, conform schemei furnizate prin
response_format. Nicio propoziție în afara JSON-ului. Niciun code fence
("code fence json").
`.trim();

// ----------------------------------------------------------------------------
// 3. JSON SCHEMA — pentru response_format: { type: "json_schema", strict: true }
// ----------------------------------------------------------------------------

export const CV_JSON_SCHEMA = {
    type: "object",
    additionalProperties: false,
    required: [
      "language",
      "target_role_inferred",
      "contact",
      "professional_summary",
      "education",
      "experience",
      "projects",
      "certificates",
      "skills",
      "ats_report",
    ],
    properties: {
      language: { type: "string", enum: ["ro", "en"] },
      target_role_inferred: {
        type: "string",
        description:
          "Rol-țintă dedus strict din headline + skills/proiecte, format scurt (ex: 'Junior Cybersecurity Analyst').",
      },
      contact: {
        type: "object",
        additionalProperties: false,
        required: ["full_name", "email", "phone", "location", "contact_link"],
        properties: {
          full_name: { type: "string" },
          email: { type: ["string", "null"] },
          phone: { type: ["string", "null"] },
          location: { type: ["string", "null"] },
          contact_link: {
            type: ["string", "null"],
            description:
              "Cel mai relevant link public disponibil: portfolio_slug > linkedin_url > github_url > personal_website_url.",
          },
        },
      },
      professional_summary: { type: "string" },
      education: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "degree_level",
            "field_of_study",
            "institution_name",
            "start_date",
            "end_date",
          ],
          properties: {
            degree_level: { type: "string" },
            field_of_study: { type: "string" },
            institution_name: { type: "string" },
            start_date: { type: "string" },
            end_date: { type: ["string", "null"] },
          },
        },
      },
      experience: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "job_title",
            "organization_name",
            "employment_type",
            "location",
            "start_date",
            "end_date",
            "bullets",
          ],
          properties: {
            job_title: { type: "string" },
            organization_name: { type: ["string", "null"] },
            employment_type: { type: "string" },
            location: { type: ["string", "null"] },
            start_date: { type: "string" },
            end_date: { type: ["string", "null"] },
            bullets: {
              type: "array",
              items: { type: "string" },
              maxItems: 5,
            },
          },
        },
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "title",
            "description_bullets",
            "technologies",
            "repo_url",
            "live_url",
          ],
          properties: {
            title: { type: "string" },
            description_bullets: {
              type: "array",
              items: { type: "string" },
              maxItems: 5,
            },
            technologies: { type: "array", items: { type: "string" } },
            repo_url: { type: ["string", "null"] },
            live_url: { type: ["string", "null"] },
          },
        },
      },
      certificates: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "title",
            "issuing_organization",
            "date_issued",
            "credential_id",
            "is_verified",
            "relevance_note",
          ],
          properties: {
            title: { type: "string" },
            issuing_organization: { type: "string" },
            date_issued: { type: "string" },
            credential_id: { type: ["string", "null"] },
            is_verified: { type: "boolean" },
            relevance_note: {
              type: ["string", "null"],
              description:
                "Justificare a relevanței față de target_role_inferred, construită STRICT din fapte deja prezente. Null dacă nu se poate construi fără a inventa.",
            },
          },
        },
      },
      skills: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "level"],
          properties: {
            name: { type: "string" },
       level: { type: "string", enum: ["Începător", "Intermediar", "Avansat"] },
          },
        },
      },
      ats_report: {
        type: "object",
        additionalProperties: false,
        required: [
          "score",
          "score_breakdown",
          "missing_or_weak_areas",
          "improvement_suggestions",
        ],
        properties: {
          score: { type: "number", minimum: 0, maximum: 100 },
          score_breakdown: {
            type: "object",
            additionalProperties: false,
            required: [
              "keyword_alignment",
              "structure_and_formatting",
              "quantifiable_impact",
              "action_verb_usage",
            ],
            properties: {
              keyword_alignment: { type: "number", minimum: 0, maximum: 100 },
              structure_and_formatting: { type: "number", minimum: 0, maximum: 100 },
              quantifiable_impact: { type: "number", minimum: 0, maximum: 100 },
              action_verb_usage: { type: "number", minimum: 0, maximum: 100 },
            },
          },
          missing_or_weak_areas: { type: "array", items: { type: "string" } },
          improvement_suggestions: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
            maxItems: 3,
          },
        },
      },
    },
} as const;

// ----------------------------------------------------------------------------
// 4. BUILDER PENTRU MESAJUL DE USER
// ----------------------------------------------------------------------------

export function buildCVGenerationUserMessage(input: CVGenerationInput): string {
  return [
    "Generează CV-ul optimizat ATS folosind EXCLUSIV datele de mai jos.",
    "Nu adăuga nicio informație care nu există în acest JSON.",
    "",
    "```json",
    JSON.stringify(input, null, 2),
    "```",
  ].join("\n");
}

// ----------------------------------------------------------------------------
// 5. EXEMPLU DE APEL (în Route Handler-ul POST /api/ai/generate-cv)
// ----------------------------------------------------------------------------

/*
import { GoogleGenAI } from "@google/genai";
import {
  CV_GENERATION_SYSTEM_PROMPT,
  CV_JSON_SCHEMA,
  buildCVGenerationUserMessage,
  type CVGenerationInput,
} from "@/lib/ai/generate-cv-prompt";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCV(input: CVGenerationInput) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: buildCVGenerationUserMessage(input),
    config: {
      systemInstruction: CV_GENERATION_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: CV_JSON_SCHEMA,
    },
  });

  const raw = response.text;
  if (!raw) throw new Error("Raspuns gol de la Gemini.");

  return JSON.parse(raw); // shape validat de schema de mai sus
}
*/
