import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduLink",
  description: "Digital academic and professional profile platform for students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}<Toaster position="top-center" richColors closeButton /></body>
    </html>
  );
}
