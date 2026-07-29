# 📝 PRD.md — PRODUCT REQUIREMENTS DOCUMENT (SPECIFICAȚII ARHITECTURALE & TEHNICE EDULINK)

> **AVERTISMENT PENTRU ASISTENȚII AI (CURSOR IDE / CLAUDE / COPILOT):**
> Acest document reprezintă unica sursă de adevăr (*Single Source of Truth*) pentru arhitectura, logica de business, securitatea și interfața aplicației web **EduLink**. Este strict interzisă devierea de la specificațiile tehnice, introducerea de funcționalități neprevăzute (*scope creep*) sau utilizarea unor biblioteci externe nespecificate. Orice linie de cod generată trebuie să fie compatibilă cu stiva tehnică definită mai jos și să conțină typing strict în TypeScript.

---

## 0. STIVA TEHNICĂ & MEDIUL DE DEZVOLTARE
* **Framework:** Next.js 16 (App Router exclusiv, fără Page Router).
* **UI Library & State:** React 19, TypeScript (Strict Mode activat, interzis `any`).
* **Styling & Design System:** Tailwind CSS 4, componente bazate pe arhitectura `shadcn/ui` (fără animații inutile sau elemente vizuale încărcate / *no AI slop*). Suport nativ și obligatoriu pentru **Light Mode** și **Dark Mode** prin variabile CSS și clase de Dark Mode.
* **Bază de date & Auth:** Supabase Cloud (PostgreSQL 16+) cu Row Level Security (RLS) strict activat, triggers automatizați și indici optimizați pe Foreign Keys și coloanele de filtrare.
* **Integrări API Externe:** 
  * **OpenAI API:** Modelul `gpt-4o-mini` (pentru microserviciile AI de analiză ATS și generare CV).
  * **Google Calendar API:** OAuth 2.0 pentru sincronizarea evenimentelor academice și interviurilor.
  * **Hipolabs Universities API:** API REST public pentru completarea automată (*autocomplete*) a numelor instituțiilor de învățământ.
* **Mediu Local & DevOps:** Găzduire locală pe discul `E:\project\edulink` (sistem Windows / PowerShell), versionare Git prin GitHub, CI/CD și deployment automat prin **Vercel (Production Ready)**. Cursor IDE utilizează servere MCP (Model Context Protocol) pentru interogarea structurii bazei de date în timp real.

---

## 1. VIZIUNEA PRODUSULUI & OBIECTIVE (PRODUCT VISION)
* **Nume Proiect:** EduLink
* **Concept:** O platformă hibridă care combină capabilitățile de networking profesional, branding și recrutare din **LinkedIn** cu minimalismul, accesibilitatea instantanee și formatul de portofoliu unificat din **Linktree**.
* **Misiunea Principală:** Integrarea organică și timpurie a studenților, elevilor și studenților internaționali (Erasmus) în piața muncii și în ecosistemul academic superior. 
* **Problema Rezolvată:** Elimină redundanța trimiterii repetitive a zeci de CV-uri și documente separate. Studentul își actualizează profilul digital o singură dată, iar platforma distribuie datele verificate prin link unic sau cod QR către angajatori, coordonatori Erasmus și comisiile de admitere.

---

## 2. ARHITECTURA UTILIZATORILOR ȘI GESTIONAREA ROLURILOR (RBAC)
Sistemul utilizează un model strict de Role-Based Access Control (RBAC), controlat prin tipul enumerat `user_role ('student', 'institution', 'company')` stocat în tabelul `profiles` din Supabase.

| Rol | Permisiuni Principale | Interdicții | Logică de Business & Valoare |
| :--- | :--- | :--- | :--- |
| **Student** *(Elev / Job Seeker)* | • CRUD complet pe profilul propriu<br>• Generare CV optimizat ATS prin AI<br>• Generare cod QR și partajare link public<br>• Aplicare 1-Click la joburi, burse și Erasmus<br>• Sincronizare evenimente în Google Calendar | Nu poate posta oportunități (joburi/burse), nu poate accesa motorul de căutare HR Engine și nu poate verifica documente. | Centralizează istoricul academic și profesional. Oferă un portofoliu digital verificabil care servește ca identitate profesională unică. |
| **Instituție** *(Universitate / Liceu / ONG)* | • Creare și editare pagină oficială de prezentare<br>• Publicare burse, cursuri, ateliere și programe Erasmus<br>• **Verificare și omologare diplome studenți** (acordarea bifei verzi `is_verified`)<br>• Panou HR-like pentru managementul admiterilor | Nu poate aplica la oportunități, nu poate modifica datele personale ale studenților (poate doar valida documentele atașate). | Asigură veridicitatea ecosistemului EduLink prin validarea oficială a diplomelor și foilor matricole ale studenților afiliați. |
| **Companie** *(Angajator / Brand)* | • Creare pagină de brand și identitate culturală<br>• Publicare joburi, internship-uri și workshop-uri tehnice<br>• **Acces complet la HR Engine** (filtrare avansată după skill-uri, GPA și certificate omologate) | Nu poate verifica documente academice (diplome/certificate), nu are acces la chat direct fără o aplicație inițială sau plan Pro. | Identifică rapid talente relevante prin filtre cumulative de competențe, economisind timp și resurse prin eliminarea CV-urilor neconforme. |

---

## 3. MAPAREA GRANULARĂ A ECRANELOR ȘI FLUXURILOR UI (USER FLOWS)

### A. Modulul de Autentificare și Înregistrare (Onboarding)
* **Ecranul Login & Sign Up (`/auth/login` și `/auth/register`):**
  * *Layout:* Card central pe fundal neutru (`#FAFAFA` în Light Mode, `#090A0F` în Dark Mode).
  * *Input-uri:* Câmpuri pentru Email și Parolă validate în timp real prin **Zod** și **React Hook Form** (regex pentru format email valid, parolă minimum 8 caractere, literă mare, cifră). Mesajele de eroare apar instantaneu sub input-uri în limba română.
  * *Social Auth:* Butoane native pentru **Google Auth** și **GitHub Auth** deasupra formularului standard, interfațate cu Supabase Auth prin `@supabase/auth-helpers-nextjs`.
* **Ecranul de Recuperare Parolă (`/auth/forgot-password`):**
  * Interfață minimală cu un input de email. Trage apelul `supabase.auth.resetPasswordForEmail()`. Supabase trimite automat un link securizat/cod de resetare configurat din panoul de administrare Supabase Auth Templates.
* **Ecranul de Selecție Rol — Obligatoriu (`/onboarding/role-select`):**
  * *Logică Gateway:* Imediat după prima autentificare cu succes, dacă interogarea către tabelul `profiles` returnează `role IS NULL` sau o valoare nesetată, utilizatorul este blocat pe această rută prin middleware-ul Next.js (`middleware.ts`).
  * *UI/UX:* Trei carduri mari interactive (Student, Instituție, Companie) cu iconițe distincte din librăria `lucide-react` și explicații concise.
  * *Backend Action:* Selectarea unui card declanșează un apel API de tip `PATCH /api/profiles/role` care execută o mutație unică în Supabase. După salvare, rolul devine imuabil din interfața utilizatorului, redirecționându-l automat către dashboard-ul specific.

### B. Dashboard Student & Formulare Colectare Date (CRUD Complet)
Toate operațiunile de modificare sau ștergere din dashboard-ul studentului (`/dashboard/student/...`) necesită ferestre modale de avertizare (*Warning Modals* bazate pe `shadcn/ui AlertDialog`) pentru acțiuni distructive (ex: „Ești sigur că vrei să ștergi acest proiect? Acțiunea este ireversibilă.”) și confirmări vizuale tip Toast (`sonner`) pentru salvări cu succes.

* **Date Personale (`/dashboard/student/profile`):**
  * *Avatar Uploader:* Conectat la Supabase Storage (bucket-ul `avatars`). Permite drag-and-drop, restricționează tipul la `PNG/JPG/WEBP` (max 2MB), generează un nume unic pe bază de UUID, urcă fișierul și salvează URL-ul public în tabelul `profiles`.
  * *Input-uri text:* Nume complet, Headline profesional (ex: „Student la Electronică | C++ & Embedded Systems”), Bio (textarea max 500 caractere), Locație, Link-uri sociale (GitHub, LinkedIn, Website personal).
* **Educație (`/dashboard/student/education`):**
  * *Autocomplete Universitate:* Input debounced (300ms) care interogează public API-ul Hipolabs: `GET http://universities.hipolabs.com/search?name={query}&country=Romania`. Când utilizatorul selectează o universitate din drop-down, numele oficial se populează în câmpul `institution_name`.
  * *Alte câmpuri:* Nivel diplomă (Licență, Master, Doctorat, Erasmus Exchange), Domeniu de studiu, Data de început, Data de sfârșit (sau switch „În curs”), Medie academică / GPA (input numeric restricționat între 1.00 și 10.00).
* **Experiență (`/dashboard/student/experience`):**
  * Tip experiență (Job Full-time, Part-time, Internship, Voluntariat), Nume companie/organizație, Titlul postului, Locație, Perioadă de activitate, Descriere detaliată (optimizată pentru analiza ATS).
* **Proiecte (`/dashboard/student/projects`):**
  * Titlu proiect, Descriere tehnică, URL depozit GitHub (validat prin regex URL), URL Live Demo.
  * *Tehnologii utilizate:* Input interactiv cu tag-uri. Utilizatorul scrie o tehnologie (ex: „C#”, „Next.js”) și apasă Enter sau virgulă; elementul se adaugă ca badge într-un array stocat ca `text[]` în PostgreSQL.
  * *Imagine Proiect:* Uploader drag-and-drop în Supabase Storage (bucket `project-images`, max 5MB).
* **Certificate & Diplome (`/dashboard/student/certificates`):**
  * Titlu certificat/diplomă, Organizație emitentă, Data emiterii, ID Credențial (opțional).
  * *Document Uploader:* Urcă fișierul PDF în bucket-ul securizat `user-documents` (max 10MB). La inserare în baza de date, coloana `is_verified` ia implicit valoarea `false`. Niciun student nu poate modifica programmatic acest flag prin interfața client sau prin API de bază.
* **Competențe / Skills (`/dashboard/student/skills`):**
  * Selecție cu două coloane: Numele competenței și Nivelul de stăpânire (selectoare cu opțiunile: Începător, Avansat, Expert). Afișate pe profil sub formă de badge-uri colorate progresiv.

### C. Panoul de Microservicii și Generatoare AI (Core Value)
Aflat în navigația principală sub secțiunea `/dashboard/student/ai-hub`.
* **Butonul „Generează CV” (Tech Blue `#0A84FF`):**
  * *Comportament UI:* La click, butonul intră în stare de loading cu spinner animat și textul „AI-ul analizează experiența ta...”.
  * *Logică Backend:* Apelează ruta pe server `POST /api/ai/generate-cv`. Route Handler-ul adună tot istoricul din tabelele `profiles`, `educations`, `experiences`, `projects` și `skills` pentru `auth.uid()`.
  * *OpenAI Integration:* Trimite payload-ul către `gpt-4o-mini` cu un System Prompt strict: reformularea acțiunilor folosind verbe puternice de impact, eliminarea greșelilor gramaticale, generarea unui scor ATS de la 0 la 100% bazat pe densitatea de cuvinte-cheie tehnice și oferirea a 3 sugestii de îmbunătățire.
  * *Output:* Răspunsul JSON este preluat și compilat pe client într-un document PDF formal, aerisit, cu fonturi lizibile (fără grafice complexe incompatibile cu cititoarele ATS) folosind `@react-pdf/renderer` sau `jspdf`, declanșând descărcarea automată.
* **Butonul „Publică Portofoliu” (Violet `#BF5AF2`):**
  * *Logică:* Transformă profilul într-o pagină publică, mapată pe ruta dinamică `/portofoliu/[qr_code_slug]`. 
  * *Paywall Feature:* Dacă utilizatorul este pe planul Student Free, adresa generată este strict de forma `https://edulink.com/portofoliu/slug-unic`. Dacă deține abonamentul Student Pro, interfața deblochează o opțiune CNAME pentru conectarea unui domeniu custom (ex: `https://alexandru-dev.ro`).
* **Butonul „Generează Cod QR” (Bordered Secondary):**
  * *Logică Tehnică:* Interzedă utilizarea API-urilor externe de tracking (ex: Google Chart API sau servicii de QR online). Generatorul apelează o funcție locală pe server sau client utilizând librăria consacrată `qrcode`.
  * *UI Modal:* Deschide un modal care prezintă codul QR generat în timp real, cu opțiuni de descărcare ca SVG (pentru printare vectorială pe CV-uri fizice) sau PNG de înaltă rezoluție (400x400px).

### D. Dashboard Programe & Marketplace (Filtrare Smart)
* **Marketplace Burse, Cursuri și Erasmus (`/marketplace`):**
  * *Layout:* Grilă responsive (1 coloană pe mobil, 2 pe tabletă, 3 pe desktop). Fiecare card conține: Badge tip (Bursă / Erasmus / Internship), Titlul, Instituția, Termenul-limită și un buton CTA „Aplică Acum” sau „Înscrie-te”.
  * *Logica 1-Click Apply:* Nu necesită re-upload de documente. Apăsarea butonului trimite un payload către `POST /api/applications`, adăugând un rând în tabelul `applications` care leagă `student_id` de `job_id`/`program_id`. Companiei sau instituției i se transmite automat permisiunea de acces la portofoliul digital și la certificatele studentului.
  * *Google Calendar Integration:* După aplicarea cu succes la un curs sau workshop, pe card apare butonul suplimentar „Salvează în Google Calendar”. La click, se inițiază un flux OAuth 2.0. După aprobare, Next.js apelează Google Calendar API (`https://www.googleapis.com/calendar/v3/calendars/primary/events`), injectând un obiect RFC 3339 conținând titlul workshop-ului, data, ora și link-ul de acces direct.

* **HR Engine — Interfața pentru Companii și Instituții (`/hr-engine`):**
  * *Accesibilitate:* Vizibilă exclusiv utilizatorilor cu rolul `company` (necesită plan Company Pro activat) și `institution`.
  * *Bară de Căutare & Filtrare Smart:* O componentă complexă de filtrare cu debouncing și interogări parametrizate în Supabase:
    * Selectoare multiple pentru skill-uri tehnice (ex: C#, Next.js, SQL).
    * Autocomplete pentru universitatea de proveniență (interogare API Hipolabs).
    * Slider pentru Medie minimă GPA (ex: doar studenți cu media > 8.50).
    * Switch-ul de încredere maximă: **„Doar studenți cu certificate verificate”**. Când este activat, interogarea SQL filtrează clienții aplicând un `JOIN` pe tabelul `certificates` unde `is_verified = true`.
  * *Afișare Rezultate:* Listă de carduri agregate de talente. Studenții care au diplome validate de o universitate au un contur de accent verde și o bifă oficială SVG lângă nume, transmițând maximă încredere recrutorilor.

---

## 4. LOGICA API-URILOR ȘI PROTECȚIA DATELOR (SECURITY DESIGN)

### A. Securitate Supabase Client & RLS (Row Level Security)
Toate tabelele din PostgreSQL trebuie să aibă RLS activat prin comanda SQL `ALTER TABLE nume_tabel ENABLE ROW LEVEL SECURITY;`. Nu se admit excepții.

```sql
-- EXEMPLU DE POLITICĂ STRICTĂ RLS PENTRU MODIFICAREA DATELOR DIN PROFIL:
CREATE POLICY "Utilizatorii pot modifica doar datele propriului profil"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- EXEMPLU DE POLITICĂ RLS PENTRU CERTIFICATE:
CREATE POLICY "Studentul isi poate edita doar propriile certificate"
ON public.certificates
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- POLITICĂ RLS PENTRU VERIFICAREA CERTIFICATELOR DE CĂTRE INSTITUȚII:
CREATE POLICY "Institutiile pot valida certificatele studentilor"
ON public.certificates
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'institution'
  )
)
WITH CHECK (is_verified = true);