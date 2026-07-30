<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🤖 AGENTS.md — AUTONOMOUS LOOP ENGINEERING DIRECTIVES FOR CODEX / CURSOR

> **ROL:** Ești un Senior Full-Stack Autonomous Software Engineer & Architect.
> **OBIECTIVUL TĂU:** Să construiești, să testezi, să depanezi și să finalizezi complet aplicația web **EduLink** conform specificațiilor din `PRD.md`, executând un ciclu autonom de dezvoltare (*Development Loop*) fără oprire până la îndeplinirea Definiției de Finalizat (*Definition of Done*).

---

## 1. REGULA AUREĂ & SURSA DE ADEVĂR

1. **`PRD.md` ESTE LEGEA ABSOLUTĂ:** Niciun fișier, rută, bază de date, componentă UI sau integrare API nu va fi creată în afara specificațiilor clare din `PRD.md`.
2. **FĂRĂ COD MOCK ÎN PRODUCȚIE:** Totul trebuie conectat la Supabase, Gemini 2.5 Flash API și servicii reale.
3. **STRICT TYPING:** Interzisă utilizarea `any` în TypeScript. Toate tipurile din Supabase trebuie generate sau aliniate exact cu schema SQL din PRD.

---

## 2. CICLUL DE DEZVOLTARE DE TIP "LOOP ENGINEERING" (THE 6-PHASE CYCLE)

Pentru fiecare funcționalitate, rută sau modul de cod pe care le abordezi, **TREBUIE** să parcurgi strict următoarele 6 faze în buclă (*loop*):

---

### 🟢 FAZA 1: PRE-FLIGHT CHECK & VERIFICARE INVARIANȚI
Înainte de a scrie o singură linie de cod nou:
* **Verificare Dependințe (`package.json`):** Verifică dacă pachetele necesare sunt instalate (`@supabase/ssr`, `lucide-react`, `tailwindcss`, `@google/genai`, `resend` etc.). Dacă lipsește vreun pachet, instalează-l imediat.
* **Verificare Rute & Fișiere:** Asigură-te că fișierele conexe există și că importurile/exporturile (*path aliases* `@/...`) sunt valide.
* **Verificare Schema Supabase:** Verifică dacă tabelele, tipurile ENUM și politicile RLS afectate de modulul curent sunt declarate corect în baza de date.

---

### 🟡 FAZA 2: PLANNING ATOMIC
* Descompune sarcina curentă în sub-sarcini izolate de maxim 50-100 de linii de cod per fișier.
* Identifică dacă componenta necesită `"use client"` (exclusiv pentru stare, evenimente de click, formate de form) sau este un **Server Component** (fetches de date direct din Supabase, SEO, layout-uri statice).

---

### 🔵 FAZA 3: EXECUȚIE & CONSTRUCȚIE DE COD
Când scrii codul, respectă cu strictețe aceste standarde:

* **Next.js 16 (App Router):** Folosește Server Actions pentru mutații de date și manipulări de formulare.
* **UI & Styling:** Tailwind CSS v4, componente `shadcn/ui`, iconițe `lucide-react`. Suport obligatoriu pentru Light/Dark mode.
* **Paletă Vizuală:** Primary Dark Teal (`#0E5E6F`), Accent Medium Teal (`#168A9B`), Background Light (`#F8FAFC`), Background Dark (`#090A0F`).
* **Securitate & Templating:**
  * **Exclusiv templates securizate în React** pentru Portofoliile/Website-urile generate pentru studenți. Este STIRCT INTERZISĂ injectarea de cod HTML brut direct prin `dangerouslySetInnerHTML`.
  * Răspunsul de la Gemini 2.5 Flash pentru ATS Check sau Website Generation va fi întotdeauna un **JSON structurat** (validate prin Zod sau TypeScript types).

---

### 🔴 FAZA 4: TESTING & VERIFICARE RIGUROASĂ
Imediat după ce ai construit modulul, execută automat următoarele verificări:

1. **Compilare TypeCheck:** Rulează `npx tsc --noEmit` pentru a detecta orice eroare de tipare TypeScript.
2. **Build Validation:** Rulează `npm run build` sau `next build` pentru a verifica dacă paginile se randeză corect fără erori de server-side rendering (SSR) sau sintaxă.
3. **Erori de Runtime & API:** Verifică tratarea cazurilor de eroare (ex: Invite Code invalid, ATS JSON malformat, fallback-uri la Feed, eșec la trimiterea email-ului de reject).
4. **RLS Verification:** Asigură-te că mutațiile în Supabase funcționează doar dacă `auth.uid()` corespunde drepturilor utilizatorului.

---

### 🟠 FAZA 5: AUTOMATED DEBUGGING & REFACTORING
Dacă Faza 4 produce erori sau avertizări:
1. **Analizează exact stack trace-ul** erorii furnizate de consolă sau compliator.
2. Identifică cauză rădăcină (ex: o variabilă nedefinită, un export lipsă, o neconcordanță între baza de date și tipul TS, o cheie API lipsă din `.env.local`).
3. Aplică remedierea (*fix*) direct în fișierele afectate.
4. **Relansează Faza 4** (Testing) pentru a confirma că eroarea a dispărut și că nu s-a produs nicio regresie în altă parte a aplicației.

---

### 🟢 FAZA 6: COMPLETARE ETAPĂ & TRECERE LA URMĂTOAREA
Dacă toate testele din Faza 4 trec fără erori:
1. Validează etapa în jurnalul tău intern de lucru.
2. Repornește **FAZA 1** pentru următoarea funcționalitate necompletată din `PRD.md`.

---

## 3. GHID SPECIFIC PE MODULE PENTRU EDULINK

### A. Auth Guard & Landing Page (`/`)
* Verifică sesiunea cu `@supabase/ssr`. Dacă utilizatorul are o sesiune activă:
  * Redirect către `/onboarding` dacă `profiles.onboarding_completed === false`.
  * Redirect către `/feed` (dacă rolul este `student`) sau `/dashboard/company` / `/dashboard/institution`.

### B. Onboarding Wizard în 4 Pași (`/onboarding`)
1. **Pas 1:** Selectare Rol (`student`, `company`, `institution`).
2. **Pas 2 (Logic & Security):**
   * *Company/Institution Join:* Câmp obligatoriu `Invite Code` de 16 caractere (verificat în tabelele `companies` / `institutions`).
   * *Company Create:* Generare automată `invite_code` de 16 caractere utilizând funcția PL/pgSQL `generate_16_char_code()`.
3. **Pas 3:** Upload Avatar în bucket-ul Supabase `avatars`.
4. **Pas 4 (Follow Cold Start):** Inserare selecție în tabelul `follows`. Actualizare `onboarding_completed = true`.

### C. LinkedIn-Style Feed (`/feed`)
* **3 Coloane (Desktop):** Mini Profile Card (Stânga), Content & Create Post Widget (Centru), Recommended & Events Widget (Dreapta).
* **Create Post Modal:** Suport pentru Postare Text/Imagine, Eveniment (cu repetare zilnică/săptămânală), Job Posting (cu configurare ATS & Rejection Email).
* **Fallback Algorithm:** Urmărite (`follows`) -> Instituție locală (`institution_id`) -> Conținut Global.

### D. Company & Institution Dashboard (`/dashboard/company`)
* **Job Applicant Management:** Interfață Kanban/Tab-uri pentru vizualizarea candidaților.
* **ATS Check Pipeline:** Generare scor (0-100) și decizie Pass/Fail prin Gemini 2.5 Flash.
* **Automated Rejection Email:** Când statusul devine `Fail` pe un criteriul `Essential`, declanșează trimiterea unui email pe adresa de Gmail a aplicantului (integrare Resend/SendGrid) cu mesajul configurat.
* **Invite Code Display:** Afișare cod de 16 caractere cu buton de copy-to-clipboard în setările companiei/instituției.

### E. Workspace Student & Portfolio Builder (`/profile/builder`)
* **Split-Screen Interactive View:** Formular completat dinamic în dreapta, Preview live în stânga.
* **Secțiuni Suportate:** Hero/Contacte, Summary (generat cu Gemini), Educație, Experiență, Proiecte, Certificate/Licențe, Voluntariat, Skills.
* **Export & Share:** Generare slug unificat + QR Code SVG/PNG + Descărcare PDF + Copiere Link Web direct.

---

## 4. DEFINIȚIA MUNCII FINALIZATE (DEFINITION OF DONE)

Codex / Agentul AI își va încheia ciclul de executare DOAR atunci când:
- [ ] Toate paginile și componentele specificate în `PRD.md` sunt create și funcționale.
- [ ] `npm run build` execută un build complet de producție cu **ZERO erori de compilare sau TypeScript**.
- [ ] Toate rutările, redirecționările de Auth Guard și operațiunile de bază de date funcționează impecabil.
- [ ] Aplicația este pregătită pentru comanda `git push` și deployment automatizat pe **Vercel**.