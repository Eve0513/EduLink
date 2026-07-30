import { BadgeCheck, ClipboardList, MonitorCog, TrendingUp } from "lucide-react";

const features = [
  { title: "Evalueaza si identifica punctele forte", copy: "Organizeaza performanta si evidentiaza competentele relevante.", icon: BadgeCheck },
  { title: "Planificare strategica", copy: "Leaga obiectivele academice de urmatorul pas profesional.", icon: ClipboardList },
  { title: "Resurse conectate", copy: "Descopera institutii, companii, evenimente si oportunitati.", icon: MonitorCog },
  { title: "Masurarea cresterii", copy: "Pastreaza un profil actualizat, verificabil si usor de distribuit.", icon: TrendingUp },
];

export function FeaturesAndAudience() {
  return <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
    <div id="features">
      <h2 className="text-2xl font-bold">Caracteristici</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {features.map(({ title, copy, icon: Icon }) => <article key={title} className="border bg-white p-5 shadow-sm dark:bg-[#102b33]"><Icon className="h-7 w-7 text-[#168A9B]" /><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{copy}</p></article>)}
      </div>
    </div>
    <div id="for-who">
      <h2 className="text-2xl font-bold">Pentru cine</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
        <AudienceCard className="bg-[#168A9B]" title="Pentru persoane" copy="Cale catre o cariera de succes" />
        <AudienceCard className="bg-[#0E5E6F]" title="Pentru companii" copy="Identifica talentele veritabile si pregatite" />
        <AudienceCard className="bg-[#003747]" title="Pentru universitati" copy="Ramaneti conectati si relevanti pe piata muncii" />
      </div>
    </div>
  </section>;
}

function AudienceCard({ className, title, copy }: { className: string; title: string; copy: string }) {
  return <article className={`min-h-28 p-6 text-white ${className}`}><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/85">{copy}</p></article>;
}
