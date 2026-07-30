import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur dark:bg-[#102b33]/95">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="EduLink acasa">
          <Image src="/logo.png" alt="EduLink" width={38} height={38} priority />
          <span className="text-xl font-bold text-[#0E5E6F]">EduLink</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="#about" className="hover:text-[#0E5E6F]">Despre noi</a>
          <a href="#features" className="hover:text-[#0E5E6F]">Caracteristici</a>
          <a href="#for-who" className="hover:text-[#0E5E6F]">Pentru cine</a>
          <a href="#testimonials" className="hover:text-[#0E5E6F]">Testimoniale</a>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Link href="/login" className="hidden text-[#0E5E6F] hover:underline sm:inline">Log in</Link>
          <Link href="/signup" className="rounded-md bg-[#0E5E6F] px-4 py-2 text-white shadow-sm transition hover:bg-[#065465]">Inregistrare</Link>
        </div>
      </nav>
    </header>
  );
}
