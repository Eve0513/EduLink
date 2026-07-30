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
  { id: "uni-2", name: "Universitatea Tehnică a Moldovei (UTM)" },
  { id: "uni-3", name: "Academia de Studii Economice din Moldova (ASEM)" },
  { id: "uni-4", name: "Universitatea de Stat de Medicină și Farmacie „Nicolae Testemițanu” (USMF)" },
  { id: "uni-5", name: "Universitatea Liberă Internațională din Moldova (ULIM)" },
  { id: "uni-6", name: "Universitatea de Stat „Alecu Russo” din Bălți (USARB)" },
  { id: "uni-7", name: "Universitatea de Stat „Bogdan Petriceicu Hasdeu” din Cahul (USCH)" }
];

export const MOCK_COLLEGES: MockItem[] = [
  { id: "coll-1", name: "Centrul de Excelență în Informatică și Tehnologii Informaționale (CEITI)" },
  { id: "coll-2", name: "Colegiul Politehnic din Chișinău" },
  { id: "coll-3", name: "Centrul de Excelență în Transporturi (Colegiul de Transporturi)" },
  { id: "coll-4", name: "Centrul de Excelență în Economie și Finanțe (CEEF)" },
  { id: "coll-5", name: "Colegiul Național de Comerț al ASEM" },
  { id: "coll-6", name: "Colegiul de Medicină din Chișinău" }
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
  { id: "loc-4", name: "Ungheni" },
  { id: "loc-5", name: "Orhei" },
  { id: "loc-6", name: "Soroca" },
  { id: "loc-7", name: "Hîncești" }
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

export const HIGH_SCHOOL_PROFILES: MockItem[] = [
  { id: "real", name: "Profil Real" },
  { id: "uman", name: "Profil Umanist" },
  { id: "arte", name: "Profil Arte" },
  { id: "sport", name: "Profil Sport" },
  { id: "tehnologic", name: "Profil Tehnologic" },
];

export const INSTITUTION_ROLES: MockItem[] = [
  { id: "rector", name: "Rector / Director" },
  { id: "decan", name: "Decan" },
  { id: "coordonator", name: "Coordonator cariera" },
  { id: "profesor", name: "Profesor / Cadru didactic" },
  { id: "administrator", name: "Administrator" },
];

export const MOCK_HIGH_SCHOOLS: MockItem[] = [
  { id: "hs-1", name: "Liceul Teoretic Orizont" },
  { id: "hs-2", name: "Liceul Teoretic Mihai Eminescu" },
  { id: "hs-3", name: "Liceul Teoretic Spiru Haret" },
  { id: "hs-4", name: "Liceul Academiei de Stiinte a Moldovei" },
];

export const EVENT_TYPE_LABELS: Record<string, string> = {
  academic_lecture: "Prelegere academica",
  workshop_training: "Workshop",
  hackathon_contest: "Hackathon",
  student_project: "Proiect studentesc",
  career_fair: "Targ de cariera",
  networking_meetup: "Networking",
  volunteer_charity: "Voluntariat",
  webinar_online: "Webinar",
  sports_recreation: "Sport si recreere",
  other: "Alt eveniment",
};
