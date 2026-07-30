AVERTISMENT PENTRU ASISTENȚII AI (CURSOR IDE / CODEX / CLAUDE):
Acest document reprezintă unica sursă de adevăr (Single Source of Truth) pentru arhitectura, logica de business, securitatea, baza de date Supabase și interfața aplicației web EduLink. Este strict interzisă devierea de la specificațiile tehnice, introducerea de funcționalități neprevăzute (scope creep) sau utilizarea unor biblioteci externe nespecificate. Orice linie de cod generată trebuie să fie compatibilă cu stiva tehnică definită mai jos și să conțină typing strict în TypeScript.

0. STIVA TEHNICĂ & MEDIUL DE DEZVOLTARE
Framework: Next.js 16 (App Router exclusiv, fără Page Router).

UI Library & State: React 19, TypeScript (Strict Mode activat, interzis any).

Styling & Design System: Tailwind CSS 4, componente bazate pe arhitectura shadcn/ui, iconițe lucide-react. Suport nativ și obligatoriu pentru Light Mode și Dark Mode.

Paletă Vizuală Brand (Landing & App):

Dark Teal (Primary): #0E5E6F / #0A4D5C

Medium Teal (Accent): #168A9B / #3A9B9B

Backgrounds: #F8FAFC (Light) / #090A0F (Dark)

Bază de date & Auth: Supabase Cloud (PostgreSQL 16+) cu Row Level Security (RLS) strict activat, triggers automatizați, indici optimizați și funcții PL/pgSQL pentru securitate.

Integrări API Externe:

Gemini API: Modelul gemini-2.5-flash (analiză ATS și optimizare CV).

Google Calendar API: OAuth 2.0 (sincronizare evenimente academice și interviuri).

Mediu Local & DevOps: Găzduire locală pe discul E:\project\edulink, versionare Git prin GitHub, CI/CD și deployment automat prin Vercel.

1. VIZIUNEA PRODUSULUI & ARHITECTURA DE NAVIGARE
A. Rutele Principale ale Aplicației
/ (Landing Page Public): Pagina de prezentare cu Gatekeeper Auth Guard (utilizatorii neautentificați văd prezentarea; utilizatorii autentificați sunt redirecționați automat către Feed sau Dashboard).

/auth/login & /auth/signup: Autentificare prin Email/Parolă și OAuth (Google/GitHub).

/onboarding: Wizard obligatoriu în 4 pași declanșat pentru conturile noi (onboarding_completed = false).

/feed: Pagina principală pentru Studenți (Layout stil LinkedIn cu 3 coloane).

/dashboard/company: Dashboard-ul HR pentru Companii (Management joburi, candidați, echipă & invite code).

/dashboard/institution: Panoul academic pentru Instituții (Management evenimente, omologare diplome, studenți afiliați).

2. LANDING PAGE & AUTH GUARD (/)
Auth Guard Middleware: Dacă supabase.auth.getUser() este valid, middleware-ul redirecționează automat utilizatorul pe /feed (dacă role === 'student') sau /dashboard/company / /dashboard/institution.

Header / Navbar: Logo EduLink (Tocă absolvent + Grafic de creștere), navigare smooth-scroll (#about, #features, #for-who, #testimonials), butoane CTA: Înregistrare (/signup) și Log In (/login).

Hero Section: Titlu H1, Subtitlu, Buton primar Dark Teal Începe Acum - Înregistrare, micro-copy: „Creează Cont pentru Acces. Obligatoriu.”, ilustrație grafică vectorială.

Secțiunea Mijloc:

Features (Grid 2x2): Evaluează Punctele Forte, Planificare Strategică, Resurse Conectate, Măsurarea Creșterii.

Pentru Cine (3 Carduri): Card Student (Teal Deschidere), Card Companie (Dark Teal), Card Universități (Medium Teal).

Secțiunea Jos: Testimoniale (3 recenzii) + Banner masiv CTA Dark Teal cu buton alb de înregistrare.

Footer: Logo, copyright și link-uri legale.

3. ONBOARDING WIZARD ÎN 4 PAȘI (/onboarding)
Declanșat automat dacă profiles.onboarding_completed = false.

[ PASUL 1: Selectare Rol ] -> [ PASUL 2: Formular Specifica Rol ] -> [ PASUL 3: Poză Profil ] -> [ PASUL 4: Follow Recomandat ] -> [ REDIRECT FINAL ]
Pasul 1: Selectare Rol (user_role)
3 carduri tactile: Student, Instituție de Învățământ, Companie.

Pasul 2: Formulare Specifice per Rol & Securitate Acces
A. Rol Student (user_role = 'student')
Nume, Prenume, Locație (oraș din mockData.ts).

Status Educațional: Tip Instituție (Liceu / Colegiu / Universitate), Selectare Instituție (din institutions), Specializare (dropdown HIGH_SCHOOL_PROFILES pentru Liceu sau DropDown pentru Universitate), Anul absolvirii (graduation_year).

Preferințe Carieră: Multi-select chips pentru roluri dorite și tipuri de oportunități (Internship, Part-time, Voluntariat, Project-based).

B. Rol Companie (user_role = 'company')
Date Reprezentant: Nume, Prenume, Job Title (ex: HR Manager, Founder).

Opțiunea A — Alăturare Companie Existente: Căutare companie în baza de date + Camp Obligatoriu: Invite Code de 16 caractere (format XXXX-XXXX-XXXX-XXXX). Validarea creează un rând în company_members cu role = 'member'.

Opțiunea B — Creare Companie Nouă: Formularea de creare (Nume Juridic, IDNO, Website, Mărime, Domeniu). Sistemul generează automat noul invite_code de 16 caractere și setează creatorul ca admin în company_members.

C. Rol Instituție (user_role = 'institution')
Date Reprezentant: Nume, Prenume, Funcție (Selectare din INSTITUTION_ROLES: Rector/Prorector, Decan/Prodecan, Coordonator Carieră, Profesor, etc.).

Selectare Instituție din listă + Câmp Obligatoriu: Invite Code de 16 caractere furnizat de conducerea instituției. Validarea creează un rând în institution_members.

Dacă instituția nu se află în listă: Formular simplu de solicitare adăugare (status pending_review).

Pasul 3: Poza de Profil & Finalizare
Uploader Avatar cu preview dinamic (Nume + Subtitlu generat automat, ex: "Arian Bucarciuc - Student la UTM").

Butoane: Continuă (salvare în Supabase Storage bucket avatars) și Omitere / Skip.

Pasul 4: Urmărire Recomandată (Cold Start Solution)
Listă de 5-8 carduri de companii de top și instituții cu buton de Follow / Urmărește.

Salvează preferințele în tabelul follows. Buton de finalizare Continuă către Platformă.

4. FEED-UL PRINCIPAL (/feed) & MECANISMUL DE FOLLOW
Layout cu 3 Coloane stil LinkedIn (Desktop)
Coloana Stânga (25%): Card Mini-Profil (Avatar, Nume, Subtitlu, Locație, statistici vizualizări profil, link rapid către /profile).

Coloana Centru (50%): Widget "Începe o postare / un anunț" + Feed de conținut cu scroll infinit + Carduri inline cu recomandări de conturi.

Coloana Dreapta (25%): Widget "Recomandat pentru tine" (companii/instituții noi cu buton FollowButton) + Widget "Evenimente Viitoare".

Algoritmul de Încărcare a Feed-ului (Fallback Logic)
Nivel 1: Postări de la entitățile urmărite din tabelul follows.

Nivel 2 (Fallback Local): Postări și anunțuri asociate cu instituția de învățământ a studentului (institution_id).

Nivel 3 (Fallback Global): Postări recente, joburi active și evenimente globale de pe platformă.

5. CREARE CONȚINUT ÎN FEED (POSTĂRI, EVENIMENTE, JOBURI)
În /feed (coloana centrală) și în profilul utilizatorilor va exista un widget principal de creare: „Începe o postare / un anunț”, similar cu interfața LinkedIn. Acesta conține un input text fals care deschide un Modal (Popup) și 3 butoane rapide dedesubt: 📷 Imagine, 📅 Eveniment, 💼 Job.

A. Creare Postare (Referință: post.jpg)
UI/Modal: Fereastră cu avatarul utilizatorului, selector de vizibilitate (Public / Doar Urmăritori) și o zonă de text extinsă (textarea).

Funcționalități:

Bară de instrumente jos cu iconițe pentru: Adăugare Imagine, Etichetare persoane, Locație.

Buton Postează (dezactivat dacă textul este gol).

B. Creare Eveniment (Referință: eveniment.jpg & frecventa event.jpg)
UI/Modal: Formular cu scroll.

Câmpuri: Imagine de copertă, Titlu Eveniment, Format (Fizic / Virtual), Dată/Oră început, Fus orar.

Frecvență: Dropdown pentru repetare (Niciodată, Zilnic, Săptămânal) cu setarea Datei/Orei de terminare.

Detalii & Vizibilitate: Textarea pentru descriere, listă de coorganizatori, toggle pentru "Afișează lista participanților".

C. Creare Job Posting (Pentru Companii - Referință: job title for post.jpg, job post.jpg, description job.jpg, degree needed.jpg)
UI/Wizard: Proces în pași declanșat din Feed sau din Dashboard-ul Companiei.

Pas 1 (Detalii de bază): Titlu Job, Nume Companie (pre-completat), Tip Loc de Muncă (On-site, Hybrid, Remote), Locație, Tip Contract (Full-time, Internship etc.).

Pas 2 (Descriere): Editor Rich Text. Include opțiunea "✨ Draft with AI" (integrare Gemini) care generează automat o descriere profesională pornind de la titlul jobului.

Pas 3 (Screening / Degree Needed): Setarea criteriilor obligatorii. Ex: "Ai absolvit următorul nivel: [Licență/Bachelor's Degree]?". Bifă pentru Essential (obligatoriu pentru a trece de ATS).

Pas 4 (Rejection Settings): (Referință: rejection letter.jpg) Setarea unui mesaj automat de respingere și specificarea adresei de email pentru notificări.

6. DASHBOARD COMPANIE / INSTITUȚIE & SISTEMUL ATS
Ruta: /dashboard/company sau /dashboard/institution

A. Structura Interfeței (Sidenav & Main View)
Sidebar Stânga: Analytics, Joburi Active, Candidați, Setări Companie (unde se află Invite Code-ul), Șabloane Email.

Zona Centrală: Statistici generale (Vizualizări profil companie, Total Aplicanți, Rata de conversie).

B. Analiza Unui Job (Applicant Management)
Când HR-ul apasă pe un Job activ, se deschide un tabel (Kanban sau Listă) cu candidații, împărțiți în tab-uri: Toți / ATS Passed / ATS Failed / Interviu.

Ce vede HR-ul: Numele, scorul ATS, link către CV-ul/Website-ul generat pe EduLink de către student.

ATS Check Logic (Gemini 2.5 Flash):
Când un student aplică, sistemul rulează pe fundal un prompt invizibil către Gemini:

Input: Cerințele Jobului (JSON) + Profilul/CV-ul Studentului (JSON).

Output cerut: Un scor de la 0 la 100 și un status (Pass/Fail) bazat pe criteriile Essential.

Notificările de Reject (Email Integration):
Aplicația va integra un serviciu de email (ex: Resend sau SendGrid). Când un candidat primește statusul Fail din partea ATS-ului (sau respins manual de HR), sistemul trimite un email automat pe adresa de gmail a studentului folosind șablonul definit la Pasul 4 din crearea jobului.

7. WORKSPACE STUDENT: GENERATOR CV, WEBSITE & QR
Ruta: /profile/builder (Accesibilă dintr-un buton lateral din profilul studentului: „Creează Portofoliu / CV”)

A. Layout-ul Interfeței (Split-Screen)
Pagina este împărțită în două secțiuni majore, actualizate în timp real (real-time rendering):

JUMĂTATEA DREAPTĂ (Formularul Dinamic): Pre-completat automat cu datele din baza de date (profiles, educations, experiences).

JUMĂTATEA STÂNGĂ (Live Preview): O vizualizare exactă a modului în care va arăta website-ul sau CV-ul final. Include un "Color Picker" (Ex: Dark Teal, Slate, Indigo) care schimbă instant tema site-ului (bazat pe componente predefinite de Tailwind CSS).

B. Structura Formularului (Secțiuni extensibile tip Acordeon)
Fiecare secțiune poate fi reordonată prin drag-and-drop și poate include imagini, titluri și descrieri.

Hero & Contacte: Poză de profil personalizată, Nume, Funcție. Linkuri integrate (Gmail, Telefon, GitHub, LinkedIn).

Summary (Analiză AI): Un buton "✨ Generează Rezumat cu AI" - Gemini analizează toate datele introduse mai jos și scrie un paragraf atractiv despre capabilitățile studentului.

Educație: Selectare Instituție, Degree, Anii de studiu.

Experiență: Detalii job/internship, date, descriere.

Opțional - Proiecte: Titlu, Descriere, Link Git, Live Demo, Imagini de prezentare a proiectului, Rolul studentului.

Opțional - Certificate și Licențe: Titlu, Organizația emitentă, ID Credentials, Link verificare, fișier atașat.

Opțional - Voluntariat: Format similar cu experiența.

Opțional - Skills (Aptitudini): Tag-uri introduse manual sau sugerate de AI.

C. Generare, Publicare & Persistență
Odată ce utilizatorul dă click pe „Salvează și Publică”, se întâmplă următoarele:

Datele sunt actualizate în tabelele respective din baza de date Supabase.

Sistemul generează un slug unic (ex: edulink.md/portofoliu/nume-prenume-id).

Sistemul generează un Cod QR care, la scanare, duce direct către acest link.

Header-ul de acțiuni: Deasupra Live Preview-ului vor sta mereu fixe următoarele butoane:

🌐 Copiază Link Website (Site-ul este mereu live și salvat; studentul se poate întoarce oricând să-l copieze sau editeze).

📄 Descarcă PDF (CV) (Transformă template-ul web într-un format A4 optimizat pentru printare/trimitere directă).

📱 Descarcă QR Code.


8. SCHEMĂ COMPLETĂ BAZĂ DE DATE SUPABASE (SQL Engine)
SQL
-- ====================================================================
-- 1. TIPURI ENUMERATE & FUNCȚII AJUTĂTOARE
-- ====================================================================
CREATE TYPE user_role AS ENUM ('student', 'institution', 'company', 'admin');
CREATE TYPE ai_generation_type AS ENUM ('cv_optimization', 'website_portfolio', 'ats_check');
CREATE TYPE work_mode AS ENUM ('onsite', 'hybrid', 'remote');
CREATE TYPE job_type AS ENUM ('fulltime', 'parttime', 'contract', 'volunteer', 'temporary', 'internship', 'other');
CREATE TYPE event_mode AS ENUM ('fizic', 'virtual');
CREATE TYPE event_frequency AS ENUM ('niciodata', 'zilnic', 'saptamanal');
CREATE TYPE degree_type AS ENUM ('Licenta', 'Master', 'Doctorat', 'Bacalaureat');
CREATE TYPE follow_target_type AS ENUM ('user', 'company', 'institution');

-- Funcție pentru generare Invite Code unice de 16 caractere (ex: A1B2-C3D4-E5F6-G7H8)
CREATE OR REPLACE FUNCTION generate_16_char_code() 
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..16 LOOP
    IF i IN (5, 9, 13) THEN
      result := result || '-';
    END IF;
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 2. TABELE PRINCIPALE & PROFILURI
-- ====================================================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role user_role DEFAULT 'student' NOT NULL,
    headline TEXT,
    bio TEXT,
    avatar_url TEXT,
    background_url TEXT,
    location TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    followers_count INT DEFAULT 0,
    qr_code_slug TEXT UNIQUE
);

-- Preferințe Studenți (din onboarding)
CREATE TABLE student_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    desired_job_titles TEXT[],
    opportunity_types TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- 3. TABELE COMPANII, INSTITUȚII & AFILIERE (INVITE CODES)
-- ====================================================================
CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    location TEXT,
    sector TEXT,
    website TEXT,
    company_size TEXT,
    idno TEXT,
    invite_code TEXT UNIQUE DEFAULT generate_16_char_code(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE company_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    job_title TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, company_id)
);

CREATE TABLE institutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('liceu', 'colegiu', 'universitate')),
    city TEXT,
    website TEXT,
    invite_code TEXT UNIQUE DEFAULT generate_16_char_code(),
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE institution_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    job_title TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, institution_id)
);

-- ====================================================================
-- 4. SISTEMUL DE FOLLOW (URMĂRIRE)
-- ====================================================================
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type follow_target_type NOT NULL,
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(follower_id, target_type, target_id)
);

-- ====================================================================
-- 5. TABELE STUDENT (EDUCAȚIE, EXPERIENȚĂ, PROIECTE, CERTIFICATE)
-- ====================================================================
CREATE TABLE educations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    institution_name TEXT NOT NULL,
    degree degree_type NOT NULL,
    field_of_study TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    graduation_year INT,
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
    is_verified BOOLEAN DEFAULT false
);

CREATE TABLE skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    level TEXT CHECK (level IN ('incepator','Avansat','Expert'))
);

-- ====================================================================
-- 6. CONȚINUT, IOBURI, EVENIMENTE & AI GENERATIONS
-- ====================================================================
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

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
    title TEXT NOT NULL,
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
-- 7. POLITICI RLS (ROW LEVEL SECURITY)
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

-- Politici Selectare Publică
CREATE POLICY "Profiluri publice" ON profiles FOR SELECT USING (true);
CREATE POLICY "Companii publice" ON companies FOR SELECT USING (true);
CREATE POLICY "Instituții publice" ON institutions FOR SELECT USING (true);
CREATE POLICY "Postări publice" ON posts FOR SELECT USING (true);
CREATE POLICY "Joburi publice" ON jobs FOR SELECT USING (true);
CREATE POLICY "Evenimente publice" ON events FOR SELECT USING (true);
CREATE POLICY "Urmăriri publice" ON follows FOR SELECT USING (true);

-- Politici Mutare Privată (CRUD)
CREATE POLICY "Editare profil propriu" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "CRUD educatie proprie" ON educations FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "CRUD experienta proprie" ON experiences FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "CRUD proiecte proprii" ON projects FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "CRUD postari proprii" ON posts FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "CRUD follow propriu" ON follows FOR ALL USING (auth.uid() = follower_id);
6. GHID PENTRU ASISTENTUL AI (CODEX / CURSOR IDE)
Când generezi componente noi, verifică întotdeauna compatibilitatea cu Next.js 16 (App Router) și folosește "use client" doar acolo unde există interactivitate în browser.

În toate Server Actions sau API Route Handlers, validează drepturile utilizatorului prin auth.uid() din Supabase.

Câmpul invite_code de 16 caractere trebuie afișat în panoul de administrare al companiilor și instituțiilor (/dashboard/company/settings), oferind buton de copiere rapidă în clipboard.

În interfața de Onboarding, redirecționarea finală se face doar după actualizarea flag-ului onboarding_completed = true.

