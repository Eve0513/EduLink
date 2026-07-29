# 📝 PRD.md — PRODUCT REQUIREMENTS DOCUMENT (SPECIFICAtII ARHITECTURALE & TEHNICE EDULINK)

> **AVERTISMENT PENTRU ASISTENtII AI (CURSOR IDE / CLAUDE / COPILOT):**
> Acest document reprezinta unica sursa de adevar (*Single Source of Truth*) pentru arhitectura, logica de business, securitatea si interfata aplicatiei web **EduLink**. Este strict interzisa devierea de la specificatiile tehnice, introducerea de functionalitati neprevazute (*scope creep*) sau utilizarea unor biblioteci externe nespecificate. Orice linie de cod generata trebuie sa fie compatibila cu stiva tehnica definita mai jos si sa contina typing strict in TypeScript.

---

## 0. STIVA TEHNICa & MEDIUL DE DEZVOLTARE
* **Framework:** Next.js 16 (App Router exclusiv, fara Page Router).
* **UI Library & State:** React 19, TypeScript (Strict Mode activat, interzis `any`).
* **Styling & Design System:** Tailwind CSS 4, componente bazate pe arhitectura `shadcn/ui` (fara animatii inutile sau elemente vizuale incarcate / *no AI slop*). Suport nativ si obligatoriu pentru **Light Mode** si **Dark Mode** prin variabile CSS si clase de Dark Mode.
* **Baza de date & Auth:** Supabase Cloud (PostgreSQL 16+) cu Row Level Security (RLS) strict activat, triggers automatizati si indici optimizati pe Foreign Keys si coloanele de filtrare.
* **Integrari API Externe:** 
  * **OpenAI API:** Modelul `gpt-4o-mini` (pentru microserviciile AI de analiza ATS si generare CV).
  * **Google Calendar API:** OAuth 2.0 pentru sincronizarea evenimentelor academice si interviurilor.
* **Mediu Local & DevOps:** Gazduire locala pe discul `E:\project\edulink` (sistem Windows / PowerShell), versionare Git prin GitHub, CI/CD si deployment automat prin **Vercel (Production Ready)**. Cursor IDE utilizeaza servere MCP (Model Context Protocol) pentru interogarea structurii bazei de date in timp real.

---

## 1. VIZIUNEA PRODUSULUI & OBIECTIVE (PRODUCT VISION)
* **Nume Proiect:** EduLink
* **Concept:** O platforma hibrida care combina capabilitatile de networking profesional, branding si recrutare din **LinkedIn** cu minimalismul, accesibilitatea instantanee si formatul de portofoliu unificat din **Linktree** si postarea evenimentelor si postarea propriu zisa de pe **Facebook**
* **Misiunea Principala:** Integrarea organica si timpurie a studentilor, elevilor si studentilor internationali (Erasmus) in piata muncii si in ecosistemul academic superior. 
* **Problema Rezolvata:** Elimina redundanta trimiterii repetitive a zeci de CV-uri si documente separate. Studentul isi actualizeaza profilul digital o singura data, iar platforma distribuie datele verificate prin link unic sau cod QR catre angajatori, coordonatori Erasmus si comisiile de admitere.

---

## 2. ARHITECTURA UTILIZATORILOR sI GESTIONAREA ROLURILOR (RBAC)
Sistemul utilizeaza un model strict de Role-Based Access Control (RBAC), controlat prin tipul enumerat `user_role ('student', 'institution', 'company')` stocat in tabelul `profiles` din Supabase.

| Rol | Permisiuni Principale | Interdictii | Logica de Business & Valoare |
| :--- | :--- | :--- | :--- |
| **Student** *(Elev / Job Seeker)* | • CRUD complet pe profilul propriu<br>• Generare CV optimizat ATS prin AI<br>• Generare cod QR si partajare link public<br>• Aplicare 1-Click la joburi, burse si Erasmus<br>• Sincronizare evenimente in Google Calendar | Nu poate posta oportunitati (joburi/burse), nu poate accesa motorul de cautare HR Engine si nu poate verifica documente. | Centralizeaza istoricul academic si profesional. Ofera un portofoliu digital verificabil care serveste ca identitate profesionala unica. |
| **Institutie** *(Universitate / Liceu / ONG)* | • Creare si editare pagina oficiala de prezentare<br>• Publicare burse, cursuri, ateliere si programe Erasmus<br>• **Verificare si omologare diplome studenti** (acordarea bifei verzi `is_verified`)<br>• Panou HR-like pentru managementul admiterilor | Nu poate aplica la oportunitati, nu poate modifica datele personale ale studentilor (poate doar valida documentele atasate). | Asigura veridicitatea ecosistemului EduLink prin validarea oficiala a diplomelor si foilor matricole ale studentilor afiliati. |
| **Companie** *(Angajator / Brand)* | • Creare pagina de brand si identitate culturala<br>• Publicare joburi, internship-uri si workshop-uri tehnice<br>• **Acces complet la HR Engine** (filtrare avansata dupa skill-uri, GPA si certificate omologate) | Nu poate verifica documente academice (diplome/certificate), nu are acces la chat direct fara o aplicatie initiala sau plan Pro. | Identifica rapid talente relevante prin filtre cumulative de competente, economisind timp si resurse prin eliminarea CV-urilor neconforme. |

---

## 3. MAPAREA GRANULARa A ECRANELOR sI FLUXURILOR UI (USER FLOWS)

### A. Modulul de Autentificare si inregistrare (Onboarding)
* **Ecranul Login & Sign Up (`/auth/login` si `/auth/register`):**
  * *Layout:* Card central pe fundal neutru (`#FAFAFA` in Light Mode, `#090A0F` in Dark Mode).
  * *Input-uri:* Campuri pentru Email si Parola validate in timp real prin **Zod** si **React Hook Form** (regex pentru format email valid, parola minimum 8 caractere, litera mare, cifra). Mesajele de eroare apar instantaneu sub input-uri in limba romana.
  * *Social Auth:* Butoane native pentru **Google Auth** si **GitHub Auth** deasupra formularului standard, interfatate cu Supabase Auth prin `@supabase/auth-helpers-nextjs`.
* **Ecranul de Recuperare Parola (`/auth/forgot-password`):**
  * Interfata minimala cu un input de email. Trage apelul `supabase.auth.resetPasswordForEmail()`. Supabase trimite automat un link securizat/cod de resetare configurat din panoul de administrare Supabase Auth Templates.
* **Ecranul de Selectie Rol — Obligatoriu (`/onboarding/role-select`):**
  * *Logica Gateway:* Imediat dupa prima autentificare cu succes, daca interogarea catre tabelul `profiles` returneaza `role IS NULL` sau o valoare nesetata, utilizatorul este blocat pe aceasta ruta prin middleware-ul Next.js (`middleware.ts`).
  * *UI/UX:* Trei carduri mari interactive (Student, Institutie, Companie) cu iconite distincte din libraria `lucide-react` si explicatii concise.
  * *Backend Action:* Selectarea unui card declanseaza un apel API de tip `PATCH /api/profiles/role` care executa o mutatie unica in Supabase. Dupa salvare, rolul devine imuabil din interfata utilizatorului, redirectionandu-l automat catre dashboard-ul specific.

### B. Dashboard Student & Formulare Colectare Date (CRUD Complet)
Toate operatiunile de modificare sau stergere din dashboard-ul studentului (`/dashboard/student/...`) necesita ferestre modale de avertizare (*Warning Modals* bazate pe `shadcn/ui AlertDialog`) pentru actiuni distructive (ex: „Esti sigur ca vrei sa stergi acest proiect? Actiunea este ireversibila.”) si confirmari vizuale tip Toast (`sonner`) pentru salvari cu succes.

* **Date Personale (`/dashboard/student/profile`):**
  * *Avatar Uploader:* Conectat la Supabase Storage (bucket-ul `avatars`). Permite drag-and-drop, restrictioneaza tipul la `PNG/JPG/WEBP` (max 2MB), genereaza un nume unic pe baza de UUID, urca fisierul si salveaza URL-ul public in tabelul `profiles`.
  * *Input-uri text:* Nume complet, Headline profesional (ex: „Student la Electronica | C++ & Embedded Systems”), Bio (textarea max 500 caractere), Locatie, Link-uri sociale (GitHub, LinkedIn, Website personal).
* **Educatie (`/dashboard/student/education`):**
  * *Autocomplete Universitate:* Input debounced (300ms) care interogeaza fisierul `mockData.ts` Cand utilizatorul selecteaza o universitate din drop-down, numele oficial se populeaza in campul `institution_name`.
  * *Alte campuri:* Nivel diploma (Licenta, Master, Doctorat, Erasmus Exchange), Domeniu de studiu, Data de inceput, Data de sfarsit (sau switch „in curs”), Medie academica / GPA (input numeric restrictionat intre 1.00 si 10.00).
* **Experienta (`/dashboard/student/experience`):**
  * Tip experienta (Job Full-time, Part-time, Internship, Voluntariat), Nume companie/organizatie, Titlul postului, Locatie, Perioada de activitate, Descriere detaliata (optimizata pentru analiza ATS).
* **Proiecte (`/dashboard/student/projects`):**
  * Titlu proiect, Descriere tehnica, URL depozit GitHub (validat prin regex URL), URL Live Demo.
  * *Tehnologii utilizate:* Input interactiv cu tag-uri. Utilizatorul scrie o tehnologie (ex: „C#”, „Next.js”) si apasa Enter sau virgula; elementul se adauga ca badge intr-un array stocat ca `text[]` in PostgreSQL.
  * *Imagine Proiect:* Uploader drag-and-drop in Supabase Storage (bucket `project-images`, max 5MB).
* **Certificate & Diplome (`/dashboard/student/certificates`):**
  * Titlu certificat/diploma, Organizatie emitenta, Data emiterii, ID Credential (optional).
  * *Document Uploader:* Urca fisierul PDF in bucket-ul securizat `user-documents` (max 10MB). La inserare in baza de date, coloana `is_verified` ia implicit valoarea `false`. Niciun student nu poate modifica programmatic acest flag prin interfata client sau prin API de baza.
* **Competente / Skills (`/dashboard/student/skills`):**
  * Selectie cu doua coloane: Numele competentei si Nivelul de stapanire (selectoare cu optiunile: incepator, Avansat, Expert). Afisate pe profil sub forma de badge-uri colorate progresiv.

### C. Panoul de Microservicii si Generatoare AI (Core Value)
Aflat in navigatia principala sub sectiunea `/dashboard/student/ai-hub`.
* **Butonul „Genereaza CV” (Turquoise`#065465`):**
  * *Comportament UI:* La click, butonul intra in stare de loading cu spinner animat si textul „AI-ul analizeaza experienta ta...”.
  * *Logica Backend:* Apeleaza ruta pe server `POST /api/ai/generate-cv`. Route Handler-ul aduna tot istoricul din tabelele `profiles`, `educations`, `experiences`, `projects`, `profiles`, `certificats` si `skills` pentru `auth.uid()`.
  * *OpenAI Integration:* Trimite payload-ul catre `gpt-4o-mini` cu un System Prompt strict: reformularea actiunilor folosind verbe puternice de impact, eliminarea greselilor gramaticale, generarea unui scor ATS de la 0 la 100% bazat pe densitatea de cuvinte-cheie tehnice si oferirea a 3 sugestii de imbunatatire.
  * *Output:* Raspunsul JSON este preluat si compilat pe client intr-un document PDF formal, aerisit, cu fonturi lizibile (fara grafice complexe incompatibile cu cititoarele ATS) folosind `@react-pdf/renderer` sau `jspdf`, declansand descarcarea automata.
* **Butonul „Publica Portofoliu” (Turquoise`#065465`):**
  * *Logica:* Transforma profilul intr-o pagina publica, mapata pe ruta dinamica `/portofoliu/[qr_code_slug]`. 
* **Butonul „Genereaza Cod QR” (Bordered Secondary):**
  * *Logica Tehnica:* Interzeda utilizarea API-urilor externe de tracking (ex: Google Chart API sau servicii de QR online). Generatorul apeleaza o functie locala pe server sau client utilizand libraria consacrata `qrcode`.
  * *UI Modal:* Deschide un modal care prezinta codul QR generat in timp real, cu optiuni de descarcare ca SVG (pentru printare vectoriala pe CV-uri fizice) sau PNG de inalta rezolutie (400x400px).

### D. Dashboard Programe & Marketplace (Filtrare Smart)
* **Marketplace Burse, Cursuri si Erasmus (`/marketplace`):**
  * *Layout:* Grila responsive (1 coloana pe mobil, 2 pe tableta, 3 pe desktop). Fiecare card contine: Badge tip (Bursa / Erasmus / Internship), Titlul, Institutia, Termenul-limita si un buton CTA „Aplica Acum” sau „inscrie-te”.
  * *Logica 1-Click Apply:* Nu necesita re-upload de documente. Apasarea butonului trimite un payload catre `POST /api/applications`, adaugand un rand in tabelul `applications` care leaga `student_id` de `job_id`/`program_id`. Companiei sau institutiei i se transmite automat permisiunea de acces la portofoliul digital si la certificatele studentului.
  * *Google Calendar Integration:* Dupa aplicarea cu succes la un curs sau workshop, pe card apare butonul suplimentar „Salveaza in Google Calendar”. La click, se initiaza un flux OAuth 2.0. Dupa aprobare, Next.js apeleaza Google Calendar API (`https://www.googleapis.com/calendar/v3/calendars/primary/events`), injectand un obiect RFC 3339 continand titlul workshop-ului, data, ora si link-ul de acces direct.

* **HR Engine — Interfata pentru Companii si Institutii (`/hr-engine`):**
  * *Accesibilitate:* Vizibila exclusiv utilizatorilor cu rolul `company` si `institution`.
  * *Bara de Cautare & Filtrare Smart:* O componenta complexa de filtrare cu debouncing si interogari parametrizate in Supabase:
    * Selectoare multiple pentru skill-uri tehnice (ex: C#, Next.js, SQL).
    * Autocomplete pentru universitatea de provenienta `mockData.ts`.
    * Slider pentru Medie minima GPA (ex: doar studenti cu media > 8.50).

---

## 4. LOGICA API-URILOR sI PROTECtIA DATELOR (SECURITY DESIGN)

### A. Securitate Supabase Client & RLS (Row Level Security)
Toate tabelele din PostgreSQL trebuie sa aiba RLS activat prin comanda SQL `ALTER TABLE nume_tabel ENABLE ROW LEVEL SECURITY;`. Nu se admit exceptii.

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
    level TEXT CHECK (level IN ('incepator','Avansat','Expert'))
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
CREATE POLICY "Utilizatorii isi pot modifica doar propriul profil" ON profiles FOR UPDATE USING (auth.uid() = id);


-- Educatie, Experienta, Proiecte, Certificate, Skills
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


-- Politici pentru Postari (Feed)
CREATE POLICY "Postarile sunt vizibile publicului" ON posts FOR SELECT USING (true);
CREATE POLICY "CRUD complet pe postari proprii" ON posts FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);


-- Politici pentru Joburi
CREATE POLICY "Joburile sunt vizibile publicului" ON jobs FOR SELECT USING (true);
CREATE POLICY "Doar companiile isi pot gestiona joburile" ON jobs FOR ALL USING (auth.uid() = company_id) WITH CHECK (auth.uid() = company_id);


-- Politici pentru Evenimente
CREATE POLICY "Evenimentele sunt vizibile publicului" ON events FOR SELECT USING (true);
CREATE POLICY "CRUD complet pe evenimentele proprii" ON events FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);



