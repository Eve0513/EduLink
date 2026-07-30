import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return <footer className="border-t bg-white dark:bg-[#102b33]"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><div className="flex items-center gap-2"><Image src="/logo.png" alt="EduLink" width={28} height={28} /><span>© 2026 EduLink. Toate drepturile rezervate.</span></div><div className="flex gap-5 text-[#0E5E6F]"><Link href="/terms">Termeni si conditii</Link><Link href="/privacy">Politica de confidentialitate</Link><Link href="/contact">Contact</Link></div></div></footer>;
}
