export interface MockItem {
  id: string;
  name: string;
}

export interface SpecialityItem {
  id: string;
  name: string;
  field: string;
}

export const MOCK_UNIVERSITIES: MockItem[] = [
  { id: "uni-1", name: "Universitatea de Stat din Moldova (USM)" },
  { id: "uni-2", name: "Universitatea Pedagogică de Stat „Ion Creangă” (UPSC)" },
  { id: "uni-3", name: "Universitatea Tehnică a Moldovei (UTM)" },
  { id: "uni-4", name: "Academia de Studii Economice din Moldova (ASEM)" },
  { id: "uni-5", name: "Universitatea de Stat „Alecu Russo” din Bălți (USARB)" },
  { id: "uni-6", name: "Universitatea de Stat din Comrat (USC)" },
  { id: "uni-7", name: "Universitatea „Anghel Kanchev” din Taraclia" },
  { id: "uni-8", name: "Universitatea de Stat de Medicină și Farmacie „Nicolae Testemițanu” (USMF)" },
  { id: "uni-9", name: "Academia de Muzică, Teatru și Arte Plastice (AMTAP)" },
  { id: "uni-10", name: "Academia „Ștefan cel Mare” a Ministerului Afacerilor Interne" },
  { id: "uni-11", name: "Academia Militară a Forțelor Armate „Alexandru cel Bun” (AMFA)" },
  { id: "uni-12", name: "Universitatea Liberă Internațională din Moldova (ULIM)" },
  { id: "uni-13", name: "Universitatea Cooperatist-Comercială din Moldova (UCCM)" },
  { id: "uni-14", name: "Universitatea de Studii Politice și Economice Europene „Constantin Stere” (USPEE)" },
  { id: "uni-15", name: "Universitatea de Studii Europene din Moldova (USEM)" }
];

// COLEGII
export const MOCK_COLLEGES: MockItem[] = [
  { id: "coll-1", name: "Centrul de Excelență în Informatică și Tehnologii Informaționale (CEITI)" },
  { id: "coll-2", name: "Centrul de Excelență în Transporturi (CET)" },
  { id: "coll-3", name: "Centrul de Excelență în Construcții (CEC)" },
  { id: "coll-4", name: "Centrul de Excelență în Economie și Finanțe (CEEF)" },
  { id: "coll-5", name: "Centrul de Excelență în Medicină și Farmacie „Raisa Pacalo” (CEMF)" },
  { id: "coll-6", name: "Colegiul Politehnic din Chișinău" },
  { id: "coll-7", name: "Colegiul Național de Comerț al ASEM" },
  { id: "coll-8", name: "Colegiul Pedagogic „Ion Creangă” din Bălți" },
  { id: "coll-9", name: "Colegiul „Alexei Mateevici” din Chișinău" },
  { id: "coll-10", name: "Colegiul de Medicină din Chișinău" },
  { id: "coll-11", name: "Colegiul de Arte Plastice „Alexandru Plămădeală” din Chișinău" },
  { id: "coll-12", name: "Colegiul de Medicină Bălți" },
  { id: "coll-13", name: "Colegiul de Medicină Ungheni" },
  { id: "coll-14", name: "Colegiul de Medicină Orhei" },
  { id: "coll-15", name: "Colegiul de Medicină Cahul" },
  { id: "coll-16", name: "Colegiul Internațional de Administrare și Business" },
  { id: "coll-17", name: "Colegiul de Studii Administrative și Fiscale" },
  { id: "coll-18", name: "Colegiul Universității Libere Internaționale din Moldova" },
  { id: "coll-19", name: "Colegiul de Criminologie, Administrare și Drept „Valeriu Bujor”" },
  { id: "coll-20", name: "Colegiul Universității Tehnice a Moldovei (CUTM) din Chișinău" },
  { id: "coll-21", name: "Colegiul Tehnologic din Chișinău" },
  { id: "coll-22", name: "Colegiul de Ecologie din Chișinău" },
  { id: "coll-23", name: "Colegiul Tehnic Feroviar din Bălți" },
  { id: "coll-24", name: "Colegiul de Industrie Ușoară din Bălți" },
  { id: "coll-25", name: "Colegiul Industrial-Pedagogic din Cahul" },
  { id: "coll-26", name: "Colegiul Pedagogic „Mihai Eminescu” din Soroca" },
  { id: "coll-27", name: "Colegiul Pedagogic „Vasile Lupu” din Orhei" },
  { id: "coll-28", name: "Colegiul Pedagogic din Comrat" },
  { id: "coll-29", name: "Colegiul de Construcții din Hîncești" }
];

export const MOCK_HIGH_SCHOOLS: MockItem[] = [
  { id: "hs-1", name: "Liceul Teoretic „Mircea cel Bătrân” din Chișinău" },
  { id: "hs-2", name: "Liceul Teoretic „Mihai Eminescu” din Chișinău" },
  { id: "hs-3", name: "Liceul Teoretic „Spiru Haret” din Chișinău" },
  { id: "hs-4", name: "Liceul Teoretic „Onisifor Ghibu” din Chișinău" },
  { id: "hs-5", name: "Liceul Teoretic „Gheorghe Asachi” din Chișinău" },

  { id: "hs-6", name: "Liceul Teoretic „Mihai Eminescu” din Bălți" },
  { id: "hs-7", name: "Liceul Teoretic „Vasile Alecsandri” din Bălți" },
  { id: "hs-8", name: "Liceul Teoretic „B.P. Hașdeu” din Bălți" },

  { id: "hs-9", name: "Liceul Teoretic „Ion Creangă” din Cahul" },
  { id: "hs-10", name: "Liceul Teoretic „Ioan Vodă” din Cahul" },

  { id: "hs-11", name: "Liceul Teoretic „Vasile Lupu” din Orhei" },
  { id: "hs-12", name: "Liceul Teoretic „Ion Luca Caragiale” din Orhei" },

  { id: "hs-13", name: "Liceul Teoretic „Petru Rareș” din Soroca" },
  { id: "hs-14", name: "Liceul Teoretic „Mihai Eminescu” din Soroca" },

  { id: "hs-15", name: "Liceul Teoretic „Alexei Mateevici” din Ungheni" },
  { id: "hs-16", name: "Liceul Teoretic „Ion Creangă” din Ungheni" },

  { id: "hs-17", name: "Liceul Teoretic „Mihai Eminescu” din Hîncești" }
];


export const HIGH_SCHOOL_PROFILES = [
  { id: "real", name: "Profil Real (Mate-Info / Științe Exacte)" },
  { id: "uman", name: "Profil Umanist (Limbi Străine / Istorie)" },
  { id: "artistic", name: "Profil Artistic / Muzică / Arhitectură" },
  { id: "sportiv", name: "Profil Sportiv" },
  { id: "tehnologic", name: "Profil Tehnologic / Servicii" },
];

export const INSTITUTION_ROLES = [
  // Conducere Universitară & Școlară
  { id: "rector_prorector", name: "Rector / Prorector" },
  { id: "director_adjunct", name: "Director / Director Adjunct (Liceu / Colegiu)" },
  { id: "decan_prodecan", name: "Decan / Prodecan" },
  { id: "sef_catedra", name: "Șef Catedră / Șef Departament" },
  
  // Relații cu Studenții & Carieră (Cheie pentru EduLink)
  { id: "coordonator_cariera", name: "Coordonator Centru de Carieră & Ghidare" },
  { id: "responsabil_practica", name: "Responsabil Stagii de Practică & Parteneriate" },
  { id: "consilier_scolar", name: "Consilier Școlar / Psihopedagog" },
  
  // Cadre Didactice & Administrativ
  { id: "profesor_lector", name: "Profesor / Lector / Cadru Didactic" },
  { id: "secretar_sef", name: "Secretar Șef / Secretariat Academic" },
  { id: "admin_it", name: "Administrator IT / Sistem" },
  { id: "altul", name: "Altă funcție administrativă" },
];

export const MOCK_COMPANIES: MockItem[] = [
  { id: "comp-1", name: "Orange Moldova" },
  { id: "comp-2", name: "Moldcell" },
  { id: "comp-3", name: "Endava" },
  { id: "comp-4", name: "Amdaris" },
  { id: "comp-5", name: "Allied Testing" },
  { id: "comp-6", name: "Moldtelecom" },
  { id: "comp-7", name: "maibOTP Bank" },
  { id: "comp-8", name: "Victoriabank" },
  { id: "comp-9", name: "Moldindconbank" },
  { id: "comp-10", name: "Efes Moldova" },
  { id: "comp-11", name: "Coca-Cola HBC Moldova" },
  { id: "comp-12", name: "Purcari Wineries" },
  { id: "comp-13", name: "Kaufland Moldova" },
  { id: "comp-14", name: "Garmin Moldova" },
  { id: "comp-15", name: "Draexlmaier Automotive" },
  { id: "comp-16", name: "Gebauer & Griller" },
  { id: "comp-17", name: "Moldretail Group (Linella)" },
  { id: "comp-18", name: "Crunchyroll Moldova" },
  { id: "comp-19", name: "StarNet" }
];

export const MOCK_LOCATIONS: MockItem[] = [
  { id: "loc-1", name: "Chișinău" },
  { id: "loc-2", name: "Bălți" },
  { id: "loc-3", name: "Cahul" },
  { id: "loc-4", name: "Orhei" },
  { id: "loc-5", name: "Soroca" },
  { id: "loc-6", name: "Ungheni" },
  { id: "loc-7", name: "Hîncești" },
  { id: "loc-8", name: "Comrat" },
  { id: "loc-9", name: "Anenii Noi" },
  { id: "loc-10", name: "Călărași" },
  { id: "loc-11", name: "Căușeni" },
  { id: "loc-12", name: "Edineț" },
  { id: "loc-13", name: "Drochia" },
  { id: "loc-14", name: "Florești" },
  { id: "loc-15", name: "Rezina" },
  { id: "loc-16", name: "Ștefan Vodă" },
  { id: "loc-17", name: "Leova" }
];



export const MOCK_SPECIALITIES: SpecialityItem[] = [
  { id: "spec-1", name: "Informatica", field: "Programare" },
  { id: "spec-2", name: "Ingineria Software", field: "Programare" },
  { id: "spec-3", name: "Tehnologii Informaționale", field: "Programare" },
  { id: "spec-4", name: "Securitate Informațională", field: "Programare" },
  { id: "spec-5", name: "Design Interior", field: "Design" },
  { id: "spec-6", name: "Design Vestimentar", field: "Design" },
  { id: "spec-7", name: "Design Grafic", field: "Design" },
  { id: "spec-8", name: "Drept", field: "Avocatura" },
  { id: "spec-9", name: "Marketing", field: "Economie" },
  { id: "spec-10", name: "Planificarea și administrarea afacerilor", field: "Economie" },
  { id: "spec-11", name: "Administrarea aplicațiilor web", field: "Programare" },
  { id: "spec-12", name: "Programare și analiza produselor de program", field: "Programare" },
  { id: "spec-13", name: "Servicii administrative și de secretariat", field: "Administrativ" },
  { id: "spec-14", name: "Pedagog social", field: "Educație" },
  { id: "spec-15", name: "Îngrijirea bolnavilor", field: "Sănătate" },
  { id: "spec-16", name: "Învățământ primar", field: "Educație" },
  { id: "spec-17", name: "Educator", field: "Educație" },
  { id: "spec-18", name: "Rețele de calculatoare", field: "IT" },
  { id: "spec-19", name: "Calculatoare", field: "IT" },
  { id: "spec-20", name: "Automatizarea proceselor tehnologice", field: "Inginerie" },
  { id: "spec-21", name: "Tehnologii și rețele de telecomunicații", field: "IT" },
  { id: "spec-22", name: "Diagnosticarea tehnică a transportului auto", field: "Inginerie" },
  { id: "spec-23", name: "Exploatarea tehnică a mașinilor și utilajului pentru construcții", field: "Inginerie" },
  { id: "spec-24", name: "Mentenanța drumurilor auto", field: "Inginerie" },
  { id: "spec-25", name: "Contabilitate", field: "Economie" },
  { id: "spec-26", name: "Finanțe și asigurări", field: "Economie" },
  { id: "spec-27", name: "Finanțe și bănci", field: "Economie" },
  { id: "spec-28", name: "Interpretare instrumentală", field: "Arte" },
  { id: "spec-29", name: "Medicină", field: "Sănătate" },
  { id: "spec-30", name: "Tehnologia Informației", field: "IT" },
  { id: "spec-31", name: "Informatică Aplicată", field: "IT" },
  { id: "spec-32", name: "Arhitectură", field: "Design" },
  { id: "spec-33", name: "Stomatologie", field: "Sănătate" },
  { id: "spec-34", name: "Medicină Generală", field: "Sănătate" },
  { id: "spec-35", name: "Farmacie", field: "Sănătate" },
  { id: "spec-36", name: "Psihologie", field: "Științe Sociale" },
  { id: "spec-37", name: "Relații Internaționale", field: "Științe Sociale" },
  { id: "spec-38", name: "Business și Administrare", field: "Economie" },
  { id: "spec-39", name: "Marketing și Logistică", field: "Economie" },
  { id: "spec-40", name: "Limbi Străine Traducere/Interpretare", field: "Educație" },
  { id: "spec-41", name: "Pedagogie (Învățământ Primar/Preșcolar)", field: "Educație" }
];


export interface JobTitleItem {
  id: string;
  name: string;
  category: string;
}

export const MOCK_JOB_TITLES: JobTitleItem[] = [
  // IT și Tehnologie
  { id: "job-1", name: "Software Developer", category: "IT și Tehnologie" },
  { id: "job-2", name: "QA Engineer", category: "IT și Tehnologie" },
  { id: "job-3", name: "System Administrator", category: "IT și Tehnologie" },
  { id: "job-4", name: "Data Analyst", category: "IT și Tehnologie" },
  { id: "job-5", name: "UI/UX Designer", category: "IT și Tehnologie" },

  // Vânzări și Management Comercial
  { id: "job-6", name: "Manager Vânzări", category: "Vânzări și Management Comercial" },
  { id: "job-7", name: "Sales Consultant", category: "Vânzări și Management Comercial" },
  { id: "job-8", name: "Key Account Manager", category: "Vânzări și Management Comercial" },
  { id: "job-9", name: "Manager Achiziții", category: "Vânzări și Management Comercial" },
  { id: "job-10", name: "Reprezentant Comercial", category: "Vânzări și Management Comercial" },

  // Administrație, Finanțe și Resurse Umane
  { id: "job-11", name: "Contabil-Șef", category: "Administrație, Finanțe și Resurse Umane" },
  { id: "job-12", name: "Recruiter / HR Specialist", category: "Administrație, Finanțe și Resurse Umane" },
  { id: "job-13", name: "Office Manager", category: "Administrație, Finanțe și Resurse Umane" },
  { id: "job-14", name: "Jurist", category: "Administrație, Finanțe și Resurse Umane" },
  { id: "job-15", name: "Operator Introducere Date", category: "Administrație, Finanțe și Resurse Umane" },

  // Marketing, Design și Media
  { id: "job-16", name: "Social Media Manager", category: "Marketing, Design și Media" },
  { id: "job-17", name: "Graphic Designer", category: "Marketing, Design și Media" },
  { id: "job-18", name: "Copywriter", category: "Marketing, Design și Media" },
  { id: "job-19", name: "SEO Specialist", category: "Marketing, Design și Media" },
  { id: "job-20", name: "Content Creator", category: "Marketing, Design și Media" },

  // Servicii, Logistică și Producție
  { id: "job-21", name: "Manager Logistică", category: "Servicii, Logistică și Producție" },
  { id: "job-22", name: "Șofer Livrator", category: "Servicii, Logistică și Producție" },
  { id: "job-23", name: "Dispecer Transport", category: "Servicii, Logistică și Producție" },
  { id: "job-24", name: "Operator Call Center", category: "Servicii, Logistică și Producție" },
  { id: "job-25", name: "Tehnolog Alimentar", category: "Servicii, Logistică și Producție" },

  // Medical, Educație și Horeca
  { id: "job-26", name: "Medic Specialist", category: "Medical, Educație și Horeca" },
  { id: "job-27", name: "Farmacist", category: "Medical, Educație și Horeca" },
  { id: "job-28", name: "Chelner / Barman", category: "Medical, Educație și Horeca" },
  { id: "job-29", name: "Administrator Hotel", category: "Medical, Educație și Horeca" },
  { id: "job-30", name: "Profesor / Învățător", category: "Medical, Educație și Horeca" }
];

export const MOCK_SKILLS: MockItem[] = [
  { id: "skill-react", name: "React" },
  { id: "skill-nextjs", name: "Next.js" },
  { id: "skill-python", name: "Python" },
  { id: "skill-sql", name: "SQL" },
  { id: "skill-uiux", name: "UI/UX Design" },
  { id: "skill-figma", name: "Figma" },
  { id: "skill-customer-care", name: "Customer Care" },
  { id: "skill-excel", name: "Microsoft Excel" },
  { id: "skill-communication", name: "Comunicare" },
  { id: "skill-project-management", name: "Project Management" },
];
