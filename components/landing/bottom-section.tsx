import Link from "next/link";

const testimonials = [
  ["Student", "EduLink mi-a oferit un profil clar si usor de prezentat."],
  ["Recruiter", "Pot identifica mai rapid studenti cu experienta relevanta."],
  ["Decan", "Ne ajuta sa ramanem conectati cu parcursul studentilor."],
];

export function BottomSection() {
  return <section id="testimonials" className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
    <div><h2 className="text-2xl font-bold">Testimoniale</h2><div className="mt-6 grid gap-5 sm:grid-cols-3">{testimonials.map(([role, quote]) => <blockquote key={role} className="border-l-2 border-[#168A9B] pl-4 text-sm leading-6"><p>&quot;{quote}&quot;</p><footer className="mt-3 font-semibold text-[#0E5E6F]">{role}</footer></blockquote>)}</div></div>
    <aside className="bg-[#0E5E6F] p-8 text-center text-white sm:p-10"><h2 className="text-3xl font-bold">Gata sa te conectezi la succes?</h2><p className="mx-auto mt-4 max-w-md text-white/85">Creeaza-ti contul EduLink astazi. Toti utilizatorii trebuie sa se inregistreze.</p><Link href="/signup" className="mt-7 inline-flex rounded-md bg-white px-5 py-3 font-semibold text-[#0E5E6F] shadow-sm">Inregistreaza-te - Creeaza cont</Link><p className="mt-5 text-sm text-white/85">Ai deja un cont? <Link href="/login" className="font-semibold underline">Log in</Link></p></aside>
  </section>;
}
