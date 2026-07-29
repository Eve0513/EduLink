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
* **Mediu Local & DevOps:** Găzduire locală pe discul `E:\project\edulink` (sistem Windows / PowerShell), versionare Git prin GitHub, CI/CD și deployment automat prin **Vercel (Production Ready)**. Cursor IDE utilizează servere MCP (Model Context Protocol) pentru interogarea structurii bazei de date în timp real.

---

## 1. VIZIUNEA PRODUSULUI & OBIECTIVE (PRODUCT VISION)
* **Nume Proiect:** EduLink
* **Concept:** O platformă hibridă care combină capabilitățile de networking profesional, branding și recrutare din **LinkedIn** cu minimalismul, accesibilitatea instantanee și formatul de portofoliu unificat din **Linktree** si postarea evenimentelor si postarea propriu zisa de pe **Facebook**
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
  * *Autocomplete Universitate:* Input debounced (300ms) care interogează fisierul `mockData.ts` Când utilizatorul selectează o universitate din drop-down, numele oficial se populează în câmpul `institution_name`.
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
* **Butonul „Generează CV” (Turquoise`#065465`):**
  * *Comportament UI:* La click, butonul intră în stare de loading cu spinner animat și textul „AI-ul analizează experiența ta...”.
  * *Logică Backend:* Apelează ruta pe server `POST /api/ai/generate-cv`. Route Handler-ul adună tot istoricul din tabelele `profiles`, `educations`, `experiences`, `projects`, `profiles`, `certificats` și `skills` pentru `auth.uid()`.
  * *OpenAI Integration:* Trimite payload-ul către `gpt-4o-mini` cu un System Prompt strict: reformularea acțiunilor folosind verbe puternice de impact, eliminarea greșelilor gramaticale, generarea unui scor ATS de la 0 la 100% bazat pe densitatea de cuvinte-cheie tehnice și oferirea a 3 sugestii de îmbunătățire.
  * *Output:* Răspunsul JSON este preluat și compilat pe client într-un document PDF formal, aerisit, cu fonturi lizibile (fără grafice complexe incompatibile cu cititoarele ATS) folosind `@react-pdf/renderer` sau `jspdf`, declanșând descărcarea automată.
* **Butonul „Publică Portofoliu” (Turquoise`#065465`):**
  * *Logică:* Transformă profilul într-o pagină publică, mapată pe ruta dinamică `/portofoliu/[qr_code_slug]`. 
* **Butonul „Generează Cod QR” (Bordered Secondary):**
  * *Logică Tehnică:* Interzedă utilizarea API-urilor externe de tracking (ex: Google Chart API sau servicii de QR online). Generatorul apelează o funcție locală pe server sau client utilizând librăria consacrată `qrcode`.
  * *UI Modal:* Deschide un modal care prezintă codul QR generat în timp real, cu opțiuni de descărcare ca SVG (pentru printare vectorială pe CV-uri fizice) sau PNG de înaltă rezoluție (400x400px).

### D. Dashboard Programe & Marketplace (Filtrare Smart)
* **Marketplace Burse, Cursuri și Erasmus (`/marketplace`):**
  * *Layout:* Grilă responsive (1 coloană pe mobil, 2 pe tabletă, 3 pe desktop). Fiecare card conține: Badge tip (Bursă / Erasmus / Internship), Titlul, Instituția, Termenul-limită și un buton CTA „Aplică Acum” sau „Înscrie-te”.
  * *Logica 1-Click Apply:* Nu necesită re-upload de documente. Apăsarea butonului trimite un payload către `POST /api/applications`, adăugând un rând în tabelul `applications` care leagă `student_id` de `job_id`/`program_id`. Companiei sau instituției i se transmite automat permisiunea de acces la portofoliul digital și la certificatele studentului.
  * *Google Calendar Integration:* După aplicarea cu succes la un curs sau workshop, pe card apare butonul suplimentar „Salvează în Google Calendar”. La click, se inițiază un flux OAuth 2.0. După aprobare, Next.js apelează Google Calendar API (`https://www.googleapis.com/calendar/v3/calendars/primary/events`), injectând un obiect RFC 3339 conținând titlul workshop-ului, data, ora și link-ul de acces direct.

* **HR Engine — Interfața pentru Companii și Instituții (`/hr-engine`):**
  * *Accesibilitate:* Vizibilă exclusiv utilizatorilor cu rolul `company` și `institution`.
  * *Bară de Căutare & Filtrare Smart:* O componentă complexă de filtrare cu debouncing și interogări parametrizate în Supabase:
    * Selectoare multiple pentru skill-uri tehnice (ex: C#, Next.js, SQL).
    * Autocomplete pentru universitatea de proveniență `mockData.ts`.
    * Slider pentru Medie minimă GPA (ex: doar studenți cu media > 8.50).

---

## 4. LOGICA API-URILOR ȘI PROTECȚIA DATELOR (SECURITY DESIGN)

### A. Securitate Supabase Client & RLS (Row Level Security)
Toate tabelele din PostgreSQL trebuie să aibă RLS activat prin comanda SQL `ALTER TABLE nume_tabel ENABLE ROW LEVEL SECURITY;`. Nu se admit excepții.

### Database deja implementata in Supabase:
-- ====================================================================
-- 1. TIPURI ENUMERATE
-- ====================================================================
CREATE TYPE user_role AS ENUM ('student', 'institution', 'company', 'admin');
CREATE TYPE ai_generation_type AS ENUM ('cv_optimization', 'website_portfolio', 'ats_check');
CREATE TYPE work_mode AS ENUM ('onsite', 'hybrid', 'remote');
CREATE TYPE job_type AS ENUM ('fulltime', 'parttime', 'contract', 'volunteer', 'temporary', 'internship', 'other');
CREATE TYPE event_mode AS ENUM ('fizic', 'virtual');
CREATE TYPE event_frequency AS ENUM ('niciodata', 'zilnic', 'saptamanal');
CREATE TYPE degree_type AS ENUM ('Licenta', 'Master', 'Doctorat', 'Bacalaureat');


-- ====================================================================
-- 2. TABELE PRINCIPALE
-- ====================================================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'student' NOT NULL,
    headline TEXT,
    bio TEXT,
    avatar_url TEXT,
    background_url TEXT,
    location TEXT,
    followers_count INT DEFAULT 0,
    qr_code_slug TEXT UNIQUE
);


-- ====================================================================
-- 3. TABELE STUDENT
-- ====================================================================
CREATE TABLE educations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    institution_name TEXT NOT NULL,
    degree degree_type NOT NULL,
    field_of_study TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    gpa NUMERIC(3,2) CHECK (gpa >= 1.00 AND gpa <= 10.00)
);


CREATE TABLE experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    position_title TEXT NOT NULL,
    location TEXT,
    work_mode work_mode,
    job_type job_type,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT
);


CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    experience_id UUID REFERENCES experiences(id),
    education_id UUID REFERENCES educations(id),
    title TEXT NOT NULL,
    description TEXT,
    github_url TEXT,
    live_demo_url TEXT,
    technologies TEXT[],
    image_url TEXT
);


CREATE TABLE certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    credential_url TEXT,
 );


CREATE TABLE skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    level TEXT CHECK (level IN ('Începător','Avansat','Expert'))
);


-- ====================================================================
-- 4. TABELE AI & QR
-- ====================================================================
CREATE TABLE ai_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    generation_type ai_generation_type NOT NULL,
    input_prompt TEXT,
    generated_content JSONB NOT NULL,
    ats_score INT CHECK (ats_score BETWEEN 0 AND 100)
);


CREATE TABLE qr_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    qr_slug TEXT UNIQUE NOT NULL,
    qr_svg_url TEXT,
    qr_png_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);


-- ====================================================================
-- 5. TABELE COMPANII & EVENIMENTE
-- ====================================================================
CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    location TEXT,
    sector TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    link_site text,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);


-- 2. TABELUL JOBURI & INTERNSHIP-URI
CREATE TABLE jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);


CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT,
    location TEXT,
    start_date DATE,
    start_time TIME,
    timezone TEXT,
    mode event_mode,
    description TEXT,
    frequency event_frequency,
    end_date DATE,
    end_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);


-- ====================================================================
-- 6. TRIGGERS
-- ====================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, qr_code_slug)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'UTILIZATOR NOU'),
        LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', 'user'), ' ', '-')) || '-' || SUBSTRING(NEW.id::text, 1, 6)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();


CREATE OR REPLACE FUNCTION regenerate_qr()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM qr_codes WHERE profile_id = NEW.profile_id;
    INSERT INTO qr_codes (profile_id, qr_slug)
    VALUES (NEW.profile_id, LOWER(REPLACE(NEW.qr_slug, ' ', '-')));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE TRIGGER on_qr_regeneration
AFTER INSERT OR UPDATE ON qr_codes
FOR EACH ROW EXECUTE FUNCTION regenerate_qr();


-- ====================================================================
-- 7. RLS POLICIES
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;


-- Profiles
CREATE POLICY "Profilurile sunt publice pentru vizualizare" ON profiles FOR SELECT USING (true);
CREATE POLICY "Utilizatorii își pot modifica doar propriul profil" ON profiles FOR UPDATE USING (auth.uid() = id);


-- Educație, Experiență, Proiecte, Certificate, Skills
CREATE POLICY "Educatia este publica" ON educations FOR SELECT USING (true);
CREATE POLICY "Experienta este publica" ON experiences FOR SELECT USING (true);
CREATE POLICY "Proiectele sunt publice" ON projects FOR SELECT USING (true);
CREATE POLICY "Certificatele sunt publice" ON certificates FOR SELECT USING (true);
CREATE POLICY "Skill-urile sunt publice" ON skills FOR SELECT USING (true);


CREATE POLICY "CRUD propriu pe educatie" ON educations FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "CRUD propriu pe experienta" ON experiences FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "CRUD propriu pe proiecte" ON projects FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "CRUD propriu pe certificate" ON certificates FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "CRUD propriu pe skills" ON skills FOR ALL USING (auth.uid() = profile_id);


-- AI Generations
CREATE POLICY "Generarile AI sunt strict private" ON ai_generations FOR ALL USING (auth.uid() = profile_id);


-- QR Codes
CREATE POLICY "Codurile QR sunt private" ON qr_codes FOR ALL USING (auth.uid() = profile_id);


-- Companies
CREATE POLICY "Companiile sunt publice pentru vizualizare" ON companies FOR SELECT USING (verified = true);
CREATE POLICY "Creatorul poate edita compania" ON companies FOR UPDATE USING (auth.uid() = created_by);






-- Events
CREATE POLICY "Evenimentele sunt publice pentru vizualizare" ON events FOR SELECT USING (true);
CREATE POLICY "CRUD propriu pe evenimente" ON events FOR ALL USING (auth.uid() = creator_id);


CREATE INDEX idx_posts_creator_id ON posts(creator_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);


CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);


CREATE INDEX idx_events_creator_id ON events(creator_id);
CREATE INDEX idx_events_start_date ON events(start_date);


-- ====================================================================
-- POLITICI RLS STRICTE (ROW LEVEL SECURITY) CU 'WITH CHECK'
-- ====================================================================


ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;


-- Politici pentru Postări (Feed)
CREATE POLICY "Postarile sunt vizibile publicului" ON posts FOR SELECT USING (true);
CREATE POLICY "CRUD complet pe postari proprii" ON posts FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);


-- Politici pentru Joburi
CREATE POLICY "Joburile sunt vizibile publicului" ON jobs FOR SELECT USING (true);
CREATE POLICY "Doar companiile isi pot gestiona joburile" ON jobs FOR ALL USING (auth.uid() = company_id) WITH CHECK (auth.uid() = company_id);


-- Politici pentru Evenimente
CREATE POLICY "Evenimentele sunt vizibile publicului" ON events FOR SELECT USING (true);
CREATE POLICY "CRUD complet pe evenimentele proprii" ON events FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);



