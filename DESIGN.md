# 🎨 DESIGN.md — ARHITECTURA VIZUALa sI GHIDUL DE STIL EDULINK

> **REGULa DE AUR PENTRU CURSOR AI sI DEZVOLTATORI:**
> Acest fisier defineste standardele vizuale absolute pentru aplicatia EduLink. Este strict interzisa generarea de interfete generice, nealiniate sau Incarcate („AI Slop”). Orice componenta trebuie sa respecte grila matematica de spatiere (sistem bazat pe multipli de 4px/8px), paleta semantica Tailwind CSS v4.0 si principiile de design minimalist, inspirate din **shadcn/ui**, **Vercel Design System**, **Linear** si **Apple Dashboard**.

---

## 1. Principiile de Baza ale Designului (Design Philosophy)

* **Minimalism Premium (Function over Decoration):** Fiecare pixel are o optiune functionala clara. Se folosesc spatii albe generoase (whitespace/negative space) pentru a separa ideile, colturi rotunjite uniform (`rounded-lg` si `rounded-xl`) si umbre milimetrice (`shadow-xs`, `shadow-sm`) pentru elevatie. Nu folosim ornamente vizuale fara scop (fara forme geometrice plutitoare sau gradiente de fundal ostentative).
* **Fara „AI Slop”:** Este interzisa utilizarea chenarelor groase sau supradimensionate, a fundalurilor negre opace fara adâncime In dark mode, precum si a combinarii haotice de fonturi. Interfata trebuie sa aiba densitatea informationala a unui instrument profesional (pro-tool density), optimizata pentru utilizare zilnica.
* **Consistenta Arhitecturala (Single Design Language):** Orice tabel, card de dashboard, formular de autentificare sau modal de confirmare va mosteni aceleasi clase Tailwind fundamentale. Butoanele principale au Inaltimi fixe (`h-9` / `h-10`), padding-uri armonizate si micro-animatii identice la hover/active pe parcursul Intregului proiect.
* **Obsesia pentru Feedback-ul Imediat (Micro-Reassurance):** Orice actiune (salvare profil, generare CV cu AI, stergere proiect, Inregistrare la eveniment, Incarcare avatar) trebuie sa ofere feedback vizual instantiat: stare de loading In buton, efecte de skeleton, toast-uri discrete sau modale de confirmare cu fundal blurat (`backdrop-blur-md`).
* **Accesibilitate Nativa (a11y & Contrast):** Combinatiile de culori respecta standardul WCAG AA (contrast minim 4.5:1). Starea de focus din tastatura este vizibila clar (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).

---

## 2. Paleta de Culori (Color Palette - Tailwind CSS v4.0 Variables)

Arhitectura culorilor integreaza nuantele consacrate EduLink (Deep Ocean Teal) cu o structura neutra bazata pe **Slate**. In Tailwind CSS v4.0, definim token-urile semantice direct In fisierul global de CSS prin `@theme`.

### Culorile de Brand EduLink (Custom Palette)

* **Brand 950 (Deep Teal):** `#003747` `rgb(0, 55, 71)` — Fundaluri Intunecate premium / Accent extrem.
* **Brand 900 (Dark Teal):** `#065465` `rgb(6, 84, 101)` — Suprafete Dark Mode secundare / Borduri active.
* **Brand 800 (Teal Medium):** `#046276` `rgb(4, 98, 118)` — Stari de Hover In Dark Mode.
* **Brand 700 (Teal Primary):** `#026a81` `rgb(2, 106, 129)` — Accent principal Light Mode / Element activ.
* **Brand 600 (Teal Bright):** `#06768d` `rgb(6, 118, 141)` — Accent principal Dark Mode / Highlights.

### Configuratia `@theme` pentru Tailwind CSS v4.0 (`globals.css`)

```css
@import "tailwindcss";

@layer base {
  :root {
    --background: #f8fafc; /* slate-50 */
    --foreground: #0f172a; /* slate-900 */

    --card: #ffffff;
    --card-foreground: #0f172a;

    --popover: #ffffff;
    --popover-foreground: #0f172a;

    /* Primary Accent (EduLink Teal #026a81) */
    --primary: #026a81;
    --primary-hover: #046276;
    --primary-foreground: #ffffff;

    --secondary: #f1f5f9; /* slate-100 */
    --secondary-foreground: #0f172a;

    --muted: #f1f5f9;
    --muted-foreground: #64748b; /* slate-500 */

    --border: #e2e8f0; /* slate-200 */
    --input: #e2e8f0;

    --ring: #026a81;
    --radius: 0.5rem;
  }

  .dark {
    --background: #020617; /* slate-950 */
    --foreground: #f8fafc; /* slate-50 */

    --card: #003747; /* Deep Ocean Teal Slate */
    --card-foreground: #f8fafc;

    --popover: #065465;
    --popover-foreground: #f8fafc;

    /* Primary Accent In Dark Mode (#06768d) */
    --primary: #06768d;
    --primary-hover: #026a81;
    --primary-foreground: #ffffff;

    --secondary: #065465;
    --secondary-foreground: #f8fafc;

    --muted: #065465;
    --muted-foreground: #94a3b8; /* slate-400 */

    --border: #065465;
    --input: #065465;

    --ring: #06768d;
  }
}

/* Semantics pentru Feedback */
.status-success { color: #10b981; bg: #ecfdf5; }
.status-warning { color: #f59e0b; bg: #fffbeb; }
.status-error   { color: #e11d48; bg: #fff1f2; }
.status-info    { color: #0ea5e9; bg: #f0f9ff; }


3. Tipografie si Ierarhie Vizuala (Typography)
Se utilizeaza fontul Geist Sans sau Inter. Textul trebuie structurat clar, respectând scara de dimensiuni, greutati si spatieri.

HTML
<!-- H1: Titlu de Pagina Dashboard / Ecrane Principale -->
<h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
  Panoul General EduLink
</h1>

<!-- H2: Titlu de Card, Sectiune sau Modal -->
<h2 class="text-lg sm:text-xl font-semibold tracking-normal text-slate-900 dark:text-slate-100 leading-snug">
  Experienta Profesionala & Proiecte
</h2>

<!-- H3: Sub-sectiuni sau Nume de Proiecte In Grid -->
<h3 class="text-base font-medium text-slate-900 dark:text-slate-100 leading-normal">
  Sistem de Management cu Interfata Desktop
</h3>

<!-- Body Normal: Descrieri, Paragrafe, Text Proiecte -->
<p class="text-sm font-normal text-slate-500 dark:text-slate-400 leading-relaxed">
  Dezvoltat In C# cu Avalonia si MySQL, integrat cu scanare automata de coduri de bare.
</p>

<!-- Label / Small: Subtitluri, Metadate, Statusuri -->
<span class="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
  29 Iulie 2026 • Verificat de Universitate
</span>

<!-- Monospace: Slugs, ID-uri unice, Cai de sistem -->
<code class="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-[#026a81] dark:text-[#06768d] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
  /portofoliu/student-dev-2026
</code>
4. Ghidul Componentelor UI Core (UI Component Blueprint)
A. Butoane (Buttons)
Toate butoanele includ tranzitii fluide, stare de hover, focus vizibil si feedback vizual la apasare (active:scale-[0.98]).

HTML
<!-- 1. Buton Principal (Primary Action) -->
<button class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#026a81] px-4 text-sm font-medium text-white shadow-xs transition-all hover:bg-[#046276] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#026a81] focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:bg-[#06768d] dark:hover:bg-[#026a81]">
  <LucideIcon class="h-4 w-4" name="Sparkles"/>
  <span>Genereaza CV cu AI</span>
</button>

<!-- 2. Buton Secundar (Secondary Action) -->
<button class="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:border-[#065465] dark:bg-[#003747] dark:text-slate-100 dark:hover:bg-[#065465]">
  <LucideIcon class="h-4 w-4" name="ExternalLink"/>
  <span>Afiseaza Portofoliu</span>
</button>

<!-- 3. Buton Distructiv (Destructive Action) -->
<button class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-medium text-white shadow-xs transition-all hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:bg-rose-600 dark:hover:bg-rose-500">
  <LucideIcon class="h-4 w-4" name="Trash2"/>
  <span>sterge Proiect</span>
</button>

<!-- 4. Buton Ghost / Icon Button -->
<button class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#026a81] dark:text-slate-400 dark:hover:bg-[#065465] dark:hover:text-slate-100">
  <LucideIcon class="h-5 w-5" name="MoreHorizontal"/>
</button>
B. Câmpuri de Input si Formulare (Form Fields)
Formularele nu Isi schimba dimensiunea la focus (zero layout shift).

HTML
<div class="flex flex-col gap-1.5 w-full">
  <label for="title" class="text-xs font-medium text-slate-900 dark:text-slate-100 flex items-center justify-between">
    <span>Titlu Oportunitate / Job</span>
    <span class="text-rose-500">*</span>
  </label>
  <div class="relative">
    <input 
      type="text" 
      id="title" 
      placeholder="ex: Junior C# / Avalonia Developer"
      class="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 transition-colors focus:border-[#026a81] focus:outline-none focus:ring-2 focus:ring-[#026a81]/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#065465] dark:bg-[#003747] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#06768d] dark:focus:ring-[#06768d]/20"
    />
  </div>
  <p class="text-[11px] text-slate-500 dark:text-slate-400">
    Se alimenteaza din sugestiile locale `mockData.ts` sau permite introducerea libera.
  </p>
</div>
C. Carduri de Dashboard (Dashboard Cards)
HTML
<div class="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-sm dark:border-[#065465] dark:bg-[#003747] dark:hover:border-[#026a81]">
  <div class="flex items-start justify-between gap-4">
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#026a81] dark:group-hover:text-[#06768d] transition-colors">
          Aplicatie Gestiune Stocuri (Desktop)
        </h3>
      </div>
      <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
        Proiect dezvoltat In C# cu interfata Avalonia, baza de date MySQL si modul integrat de scanare coduri QR.
      </p>
    </div>
    <span class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-500/20 shrink-0">
      Verificat Academic
    </span>
  </div>
</div>
D. Zone de Inregistrare & Dropzone (File Uploaders)
HTML
<div class="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center transition-all duration-150 hover:border-[#026a81] hover:bg-slate-100/50 cursor-pointer dark:border-[#065465] dark:bg-[#003747]/50 dark:hover:border-[#06768d]">
  <div class="rounded-full bg-slate-100 p-3 text-slate-600 shadow-xs dark:bg-[#065465] dark:text-slate-300">
    <LucideIcon class="h-6 w-6 text-[#026a81] dark:text-[#06768d]" name="UploadCloud"/>
  </div>
  <p class="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">
    <span class="text-[#026a81] dark:text-[#06768d] hover:underline">Selecteaza un fisier PDF</span> sau trage documentul aici
  </p>
  <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
    Documente de practica, adeverinte sau diploma (Max 10 MB)
  </p>
</div>
5. Micro-Interactiuni, Stari si Feedback (UI States)
A. Stari de Incarcare (Skeletons & Spinners)
Butoanele aflate In executie afiseaza o iconita rotativa animate-spin si Isi dezactiveaza interactiunea:

HTML
<button disabled class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#026a81]/80 px-4 text-sm font-medium text-white opacity-80 cursor-not-allowed">
  <LucideIcon class="h-4 w-4 animate-spin" name="Loader2"/>
  <span>Se salveaza datele...</span>
</button>
Structurile de date In curs de Incarcare utilizeaza blocurile animate Skeleton:

HTML
<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-[#065465] dark:bg-[#003747] animate-pulse space-y-4">
  <div class="h-5 bg-slate-200 dark:bg-[#065465] rounded-md w-1/3"></div>
  <div class="space-y-2">
    <div class="h-4 bg-slate-200 dark:bg-[#065465] rounded-md w-full"></div>
    <div class="h-4 bg-slate-200 dark:bg-[#065465] rounded-md w-4/5"></div>
  </div>
</div>
B. Modale de Confirmare (Dialogs)
Modalele folosesc o pozitionare fixa, centrare pe ambele axe si fundal cu efect de estompare (backdrop-blur-xs).

HTML
<!-- Modal Backdrop -->
<div class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"></div>

<!-- Modal Content Container -->
<div class="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl border border-slate-200 bg-white p-6 shadow-xl duration-200 animate-in zoom-in-95 dark:border-[#065465] dark:bg-[#003747]">
  <div class="flex flex-col gap-2">
    <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Confirmi publicarea proiectului?</h2>
    <p class="text-sm text-slate-500 dark:text-slate-400">
      Acest proiect va deveni vizibil imediat pentru universitati si companiile partenere In sectiunea de recrutare.
    </p>
  </div>
  <div class="mt-6 flex justify-end gap-3">
    <button class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-[#065465] dark:text-slate-300 dark:hover:bg-[#065465]">
      Revino
    </button>
    <button class="rounded-lg bg-[#026a81] px-4 py-2 text-sm font-medium text-white hover:bg-[#046276] dark:bg-[#06768d]">
      Publica Acum
    </button>
  </div>
</div>
C. Notificari Toast (Feedback Imediat)
HTML
<!-- Toast Succes -->
<div class="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-md dark:border-emerald-900/50 dark:bg-emerald-950 dark:text-emerald-200">
  <LucideIcon class="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" name="CheckCircle2"/>
  <div class="text-sm font-medium">Evenimentul a fost adaugat cu succes In Google Calendar.</div>
</div>
6. Layout-ul Adaptiv (Responsive Grid & Navigation)
A. Structura Dashboard-ului (Desktop-First cu Sidebar)
Arhitectura panoului principal foloseste o dispunere adaptiva cu sidebar fix pe desktop si meniu colapsabil pe dispozitive mobile.

HTML
<div class="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex flex-col md:flex-row">
  
  <!-- Sidebar Navigare -->
  <aside class="w-full md:w-64 md:fixed md:inset-y-0 border-r border-slate-200 bg-white dark:border-[#065465] dark:bg-[#003747] z-30 flex flex-col justify-between p-4">
    <div class="space-y-6">
      <!-- Logo EduLink -->
      <div class="flex items-center gap-2 px-2 font-bold text-lg tracking-tight text-[#026a81] dark:text-[#06768d]">
        <LucideIcon class="h-6 w-6" name="GraduationCap"/>
        <span>EduLink</span>
      </div>
      <!-- Navigare -->
      <nav class="space-y-1">
        <a href="/dashboard" class="flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 dark:bg-[#065465] dark:text-slate-100">
          <LucideIcon class="h-4 w-4 text-[#026a81] dark:text-[#06768d]" name="LayoutDashboard"/>
          <span>Panou Principal</span>
        </a>
        <a href="/dashboard/jobs" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#065465] dark:hover:text-slate-100">
          <LucideIcon class="h-4 w-4" name="Briefcase"/>
          <span>Oportunitati & Joburi</span>
        </a>
      </nav>
    </div>
  </aside>

  <!-- Zona de Continut Principal -->
  <main class="flex-1 md:pl-64">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Antet Sectiune -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#065465] pb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Oportunitati Active</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Exploreaza internship-urile si pozitiile disponibile.</p>
        </div>
      </div>

      <!-- Grid Componente -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Carduri randerate dinamic -->
      </div>

    </div>
  </main>

</div>
B. Portofoliul Public (/portofoliu/[slug])
Layout-ul public este optimizat pentru vizualizare mobila (Linktree-style minimal):

Centrare Executiva: Stâlp unic pe mijloc (max-w-md mx-auto py-12 px-4 text-center).

Header Profil: Avatar generos (w-24 h-24 rounded-full border-2 border-[#026a81]/30 shadow-xs mx-auto), urmat de Nume, Titlu profesional si Bifa de Verificare Academica.

Stiva de Link-uri (Interactive Buttons Stack): Lista de actiuni direct accesibile (CV PDF generat AI, Proiect Desktop Avalonia, Repozitoriu GitHub, Contact Direct).

Zona Cod QR: In subsolul paginii, afisarea unui buton minimalist care deschide codul QR vectorial pentru scanare la standurile de recrutare sau evenimente.