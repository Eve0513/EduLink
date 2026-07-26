# 🎨 DESIGN.md — ARHITECTURA VIZUALĂ ȘI GHIDUL DE STIL EDULINK

> **REGULĂ DE AUR PENTRU CURSOR AI ȘI DEZVOLTATORI:**
> Acest fișier definește standardele vizuale absolute pentru aplicația EduLink. Este interzisă generarea de interfețe generice, nealiniate sau încărcate („AI Slop”). Orice componentă trebuie să respecte grila matematică de spațiere (sistem multiplu de 4px/8px), paleta semantică Tailwind CSS v4.0 și principiile de design minimalist, inspirate din **shadcn/ui**, **Vercel Design System**, **Linear** și **Apple Dashboard**.

---

## 1. Principiile de Bază ale Designului (Design Philosophy)

* **Minimalism Premium (Function over Decoration):** Fiecare pixel are o justificare clară. Se folosesc spații albe generoase (whitespace/negative space) pentru a ghida ochiul, colțuri rotunjite uniform și umbre milimetrice pentru elevație. Nu folosim ornamente vizuale fără funcționalitate (fără forme geometrice plutitoare sau accente inutile).
* **Toleranță Zero pentru „AI Slop”:** Este strict interzisă utilizarea gradientelor stridente, a chenarelor groase (mai mari de `1px` pentru separatori) sau luminoase, a fundalurilor negre opace fără textură în dark mode, precum și a fonturilor multiple amestecate. Elementele nu trebuie să pară supradimensionate; interfața trebuie să aibă densitatea informațională a unui instrument profesional de analiză (pro-tool density).
* **Consistență Arhitecturală (Single Design Language):** Orice tabel, card de dashboard, formular de autentificare sau modal de confirmare va moșteni aceleași clase fundamentale. Butoanele principale au întotdeauna aceeași înălțime, padding și rafinament al stărilor la interacțiune pe tot parcursul proiectului.
* **Obsesia pentru Feedback-ul Imediat (Micro-Reassurance):** O aplicație impecabilă comunică constant cu utilizatorul. Orice acțiune (salvare CV, ștergere proiect, eroare de autentificare, încărcare avatar, actualizare diplomă) trebuie să declanșeze o formă de feedback vizual: fie un mesaj tip Toast în colțul ecranului, fie un modal de confirmare sau un indicator de loading inline. Nicio acțiune nu rămâne neconfirmată.
* **Accesibilitate Nativă (a11y & Contrast):** Toate combinațiile de culoare text/fundal trebuie să respecte standardul WCAG AA (contrast minim 4.5:1 pentru text normal). Focusul din tastatură este marcat clar printr-un inel vizibil (`focus-visible:ring-2`), asigurând o navigare logică fără mouse.

---

## 2. Paleta de Culori (Color Palette - Tailwind CSS v4.0 Variables)

Arhitectura culorilor utilizează token-uri semantice bazate pe nuanțele moderne **Slate** și **Indigo** din Tailwind CSS. Nu se apelează niciodată coduri HEX fixe în clasele componentelor, ci variabilele semantice aferente temei.

### Light Mode (Curat, Strălucitor, Academic)

* **Fundal principal (`bg-background`):** `#f8fafc` (`slate-50`) – Oferă o bază caldă, nestresantă pentru ochi în utilizare îndelungată.
* **Suprafețe / Carduri (`bg-card`):** `#ffffff` (Alb pur) – Crează un contrast subtil de elevație față de fundalul principal.
* **Text Principal (`text-foreground`):** `#0f172a` (`slate-900`) – Lizibilitate maximă și contrast impecabil.
* **Text Secundar / Descrieri (`text-muted-foreground`):** `#64748b` (`slate-500`) – Folosit pentru date calendaristice, metadate și bio-uri scurte.
* **Borduri și Separatori (`border-border`):** `#e2e8f0` (`slate-200`) – Chenare fine de maxim `1px`.
* **Accent Brand (`bg-primary` / `text-primary`):** `#4f46e5` (`indigo-600`) – Albastru academic/tehnologic profund, utilizat exclusiv pentru acțiunile principale (CTA) și elementele interactive cheie.

### Dark Mode (Profound, Mat, Linear-Style)

* *Regulă:* Este interzisă utilizarea negru-lui mat 100% (`#000000`) pentru suprafețele mari, deoarece obosește vederea și elimină adâncimea interfeței.
* **Fundal principal (`bg-background`):** `#020617` (`slate-950`) – Negru ardezie profund.
* **Suprafețe / Carduri (`bg-card` / `bg-muted`):** `#0f172a` (`slate-900`) pentru carduri și `#1e293b` (`slate-800`) pentru elemente secundare (de exemplu, input-uri sau drop-down-uri).
* **Text Principal (`text-foreground`):** `#f8fafc` (`slate-50`).
* **Text Secundar (`text-muted-foreground`):** `#94a3b8` (`slate-400`).
* **Borduri și Separatori (`border-border`):** `#1e293b` (`slate-800`) – Contururi subtile care delimitează elementele fără a încărca vizual.
* **Accent Brand (`bg-primary`):** `#6366f1` (`indigo-500`) – O nuanță ușor mai deschisă decât în Light Mode pentru a menține luminozitatea optimă pe fundal întunecat.

### Culori Semantice pentru Feedback (Toate Modurile)

* **Succes (`emerald`):** `#10b981` (`emerald-500`) – Bife de verificare diplomă, confirmări de salvare, status online.
* **Avertizare (`amber`):** `#f59e0b` (`amber-500`) – Acțiuni care necesită atenție, abonamente aproape de expirare.
* **Eroare / Distructiv (`rose`):** `#e11d48` (`rose-600`) – Ștergeri de date, erori de validare formulare, eșec la autentificare.
* **Informație (`sky`):** `#0ea5e9` (`sky-500`) – Tooltip-uri instructive, ghiduri de utilizare on-boarding.

---

## 3. Tipografie și Ierarhie Vizuală (Typography)

Sistemul utilizează un singur font sans-serif geometric și modern: **Geist Sans** (preferabil, standardul Vercel) sau **Inter**. Scara tipografică este riguroasă, combinând corect dimensiunea fontului (`text-*`), greutatea (`font-*`), înălțimea liniei (`leading-*`) și spațierea între litere (`tracking-*`).

```html
<!-- H1: Titluri de Pagină Dashboard / Ecrane Principale -->
<h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
  Panoul General EduLink
</h1>

<!-- H2: Titluri de Carduri, Secțiuni și Modale -->
<h2 class="text-lg sm:text-xl font-semibold tracking-normal text-foreground leading-snug">
  Experiență Profesională
</h2>

<!-- H3: Sub-secțiuni sau Titluri de Elemente Mărunte (ex. Nume Proiect în Grid) -->
<h3 class="text-base font-medium text-foreground leading-normal">
  Platformă AI de Recrutare
</h3>

<!-- Body Normal: Descrieri, Paragrafe de text, Detalii Job -->
<p class="text-sm font-normal text-muted-foreground leading-relaxed">
  Am implementat o arhitectură bazată pe microservicii și integrare automată cu API-uri de inteligență artificială.
</p>

<!-- Label / Small: Etichete de input, statusuri, date calendaristice -->
<span class="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
  12 Octombrie 2026 • Verificat de Universitate
</span>

<!-- Monospace: Coduri QR Slugs, ID-uri unice, coduri promoționale -->
<code class="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
  /portofoliu/alex-popescu-2026
</code>


4. Ghidul Componentelor UI Core (UI Component Blueprint)
Subagenții AI trebuie să folosească strict aceste combinații de clase pentru componentele interfeței. Nu se improvizează cu padding-uri sau raze de curbură diferite (rounded-xl este standardul pentru carduri, rounded-lg pentru butoane și input-uri).

A. Butoane (Buttons)
Fiecare buton are o stare de repaus, hover, focus vizibil pentru accesibilitate, o animație subtilă de apăsare (active:scale-[0.98]) și o stare de dezactivare clară.

HTML
<!-- 1. Buton Principal (Primary Action - ex. "Generează CV", "Salvează Profilul") -->
<button class="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus-visible:ring-offset-slate-950">
  <LucideIcon class="h-4 w-4"/>
  <span>Generează CV cu AI</span>
</button>

<!-- 2. Buton Secundar (Secondary Action - ex. "Anulează", "Editează", "Vezi Portofoliu") -->
<button class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:ring-offset-slate-950">
  <span>Preview Portofoliu</span>
</button>

<!-- 3. Buton Distructiv (Destructive Action - ex. "Șterge Proiect", "Revocă Accesul") -->
<button class="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-rose-500 dark:focus-visible:ring-offset-slate-950">
  <span>Șterge Definitiv</span>
</button>
B. Câmpuri de Input și Formulare (Form Fields)
Formularele aerisite și clare sunt vitale. Chenarul își schimbă culoarea și capătă un inel subtil de focus la interacțiune, fără a mișca elementele din jur (layout shift zero).

HTML
<div class="flex flex-col gap-1.5 w-full">
  <label for="headline" class="text-xs font-medium text-foreground">
    Titlu Profesional (Headline) <span class="text-rose-500">*</span>
  </label>
  <input 
    type="text" 
    id="headline" 
    placeholder="ex: Student la Electronică & Telecomunicații | C++ & Embedded"
    class="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-slate-400 transition-colors focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
  />
  <span class="text-[11px] text-muted-foreground">
    Acest titlu va apărea sub numele tău pe portofoliul digital și în căutările HR.
  </span>
</div>
C. Carduri Element (Dashboard Cards)
Cardurile structurează secțiunile din dashboard (Proiecte, Educație, Analytics). Acestea utilizează o bordură fină, fundal curat și o umbră discretă care se amplifică ușor la hover doar pe cardurile interactive.

HTML
<div class="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
  <div class="flex items-start justify-between gap-4">
    <div class="space-y-1">
      <h3 class="text-base font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        Platformă e-Commerce full-stack
      </h3>
      <p class="text-sm text-muted-foreground line-clamp-2">
        Proiect de diplomă dezvoltat cu Next.js, Stripe și Supabase. Include panou de administrare și autentificare securizată.
      </p>
    </div>
    <span class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-500/20">
      Verificat
    </span>
  </div>
</div>
D. Avatar & File Uploaders (Drag-and-Drop Zones)
Pentru încărcarea pozelor de profil sau a diplomelor PDF în Supabase Storage, interfața oferă o zonă de drop prietenoasă vizual, cu feedback imediat când un fișier este tras deasupra ei (drag-over).

HTML
<div class="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center transition-all duration-150 hover:border-indigo-500 hover:bg-slate-100/50 cursor-pointer dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-500 dark:hover:bg-slate-800/50">
  <div class="rounded-full bg-slate-100 p-3 text-slate-600 shadow-xs dark:bg-slate-800 dark:text-slate-400">
    <!-- Lucide Icon: UploadCloud sau FileText -->
    <svg class="h-6 w-6 text-indigo-600 dark:text-indigo-400" ... />
  </div>
  <p class="mt-3 text-sm font-medium text-foreground">
    <span class="text-indigo-600 dark:text-indigo-400 hover:underline">Apasă pentru a încărca</span> sau trage documentul PDF aici
  </p>
  <p class="mt-1 text-xs text-muted-foreground">
    Dimensiune maximă: 10 MB. Formate acceptate: PDF, PNG, JPG.
  </p>
</div>
5. Micro-Interacțiuni, Stări și Feedback (UI States)
Niciun apel către API-urile externe (OpenAI, Supabase, Stripe, Google Calendar) sau acțiune CRUD nu se execută silențios.

A. Stări de Încărcare (Loading States & Skeletons)
Butoane în execuție: În momentul trimiterii unui formular, butonul trece automat în starea disabled, textul se schimbă (ex. din „Salvează” în „Se salvează...”), iar o iconiță Lucide Loader2 este randată cu clasa animate-spin.

Skeletons pentru încărcarea paginilor: Înainte de primirea datelor din PostgreSQL, structura paginii este simulată prin blocuri gri animate, menținând layout-ul exact al componentelor finale (Zero Layout Shift).

HTML
<!-- Componentă Skeleton de Card -->
<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 animate-pulse space-y-4">
  <div class="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3"></div>
  <div class="space-y-2">
    <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
    <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-4/5"></div>
  </div>
</div>
B. Modale de Confirmare și Avertizare (Dialogs / Modals)
Orice acțiune cu impact distructiv (ștergerea unui proiect, revocarea bifei de către o universitate, anularea abonamentului) declanșează un Modal Block deschis pe ecran, având pe fundal un efect de blur.

Fundal Modal (Backdrop): fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in

Container Modal: fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl border border-slate-200 bg-white p-6 shadow-lg duration-200 animate-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900

Structură Butoane Modal: Butonul de anulare (Secondary, dreapta/stânga jos) alături de butonul de acțiune principală (Destructive Roșu pentru ștergere sau Primary Indigo pentru confirmare modificări majore).

C. Sistemul de Mesaje Toast (Feedback Imediat)
Pentru acțiunile generale care nu necesită întreruperea fluxului (salvare date profil, copiere link portofoliu în clipboard, eroare de rețea ușoară), se afișează o notificare de tip Toast în colțul din dreapta-jos sau dreapta-sus al ecranului (folosind sonner sau shadcn/ui toast).

HTML
<!-- Toast Succes (ex: "Proiectul a fost salvat cu succes.") -->
<div class="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-md dark:border-emerald-900/50 dark:bg-emerald-950 dark:text-emerald-200">
  <!-- Lucide Icon: CheckCircle2 -->
  <svg class="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" ... />
  <div class="text-sm font-medium">Datele profilului au fost actualizate.</div>
</div>

<!-- Toast Eroare (ex: "Eroare la logare: Parolă incorectă.") -->
<div class="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-md dark:border-rose-900/50 dark:bg-rose-950 dark:text-rose-200">
  <!-- Lucide Icon: AlertCircle -->
  <svg class="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" ... />
  <div class="text-sm font-medium">Eroare la autentificare: Datele introduse sunt incorecte.</div>
</div>
6. Layout-ul Adaptiv (Responsive Grid & Navigation)
Aplicația EduLink este complet adaptivă (Mobile-First approach), funcționând impecabil atât pe un telefon cu ecran mic, cât și pe un monitor de 27 inch.

A. Structura Dashboard-ului (Hibrid LinkedIn + Linktree)
Arhitectura panoului de control pentru Studenți, Instituții și Companii se bazează pe o dispunere pe 2 coloane principale pe Desktop, care colapsează nativ pe verticală în ecranele de mobil.

HTML
<div class="min-h-screen bg-background flex flex-col md:flex-row">
  
  <!-- 1. Sidebar Navigare (Stânga - Fix pe Desktop, Sheet/Hamburger pe Mobil) -->
  <aside class="w-full md:w-64 md:fixed md:inset-y-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 z-30 flex flex-col justify-between p-4">
    <!-- Logo & Meniu Principal -->
    <div class="space-y-6">
      <div class="flex items-center gap-2 px-2 font-bold text-lg tracking-tight text-indigo-600 dark:text-indigo-400">
        <LucideIcon class="h-6 w-6" name="GraduationCap"/>
        <span>EduLink</span>
      </div>
      <nav class="space-y-1">
        <!-- Item Navigare Activ -->
        <a href="/dashboard" class="flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100">
          <LucideIcon class="h-4 w-4 text-indigo-600 dark:text-indigo-400" name="LayoutDashboard"/>
          <span>Panou de Control</span>
        </a>
        <!-- Item Navigare Normal -->
        <a href="/dashboard/projects" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100">
          <LucideIcon class="h-4 w-4" name="FolderGit2"/>
          <span>Proiecte & Portofoliu</span>
        </a>
      </nav>
    </div>
    <!-- User Profile & Theme Toggle la Baza Sidebar-ului -->
    <div class="border-t border-slate-200 dark:border-slate-800 pt-4 mt-auto">
      <!-- User mini-card -->
    </div>
  </aside>

  <!-- 2. Zona de Conținut Principal (Main Content Area) -->
  <main class="flex-1 md:pl-64">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Antet Secțiune cu Buton CTA -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Proiectele Tale</h1>
          <p class="text-sm text-muted-foreground mt-1">Gestionează aplicațiile, codul și demo-urile pe care le expui recrutorilor.</p>
        </div>
        <button class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-all shadow-xs">
          <LucideIcon class="h-4 w-4" name="Plus"/>
          <span>Adaugă Proiect Nou</span>
        </button>
      </div>

      <!-- Marketplace & Grid de Carduri Responsive -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Dashboard / Job Cards sunt inserate aici -->
      </div>

    </div>
  </main>

</div>
B. Vizualizarea Portofoliului Public (/portofoliu/[slug])
Această pagină publică este inspirată din estetica ultra-minimalistă Linktree, fiind concepută pentru a fi scanată rapid de pe telefonul unui recrutor HR sau deschisă prin scanarea codului QR la un eveniment de carieră.

Layout: Centrat vertical și orizontal pe un singur stâlp (max-w-md mx-auto py-12 px-4 text-center).

Header Profil: Avatar generos cu contur fin (w-24 h-24 rounded-full mx-auto border-2 border-indigo-600/20 shadow-sm), urmat de Numele Complet (H1), Titlu Profesional și Bifa de Verificare Academică din partea Universității.

Stiva de Oportunități (Linktree Buttons Stack): O listă verticală de butoane late (w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:scale-[1.02] hover:border-indigo-500 transition-all flex items-center justify-between font-medium), care trimit către: CV-ul generat AI (PDF), Profilul de LinkedIn, Repozitoriul GitHub, Live Demo-uri ale proiectelor și buton direct de „Contactează Studentul”.

QR Code Section: În subsolul portofoliului, se afișează un buton discret „Arată Codul QR pentru scanare rapidă”, care extinde un panou curat conținând codul vectorial de înaltă precizie generat local de aplicație.