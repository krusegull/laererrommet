import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lærerrommet",
  description: "Tilbakemeldinger til elevtekster og undervisningsopplegg",
};

const navLinks = [
  { href: "/", label: "Forside" },
  { href: "/elever", label: "Elever" },
  { href: "/opplegg", label: "Undervisningsopplegg" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="no" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">
                L
              </span>
              Lærerrommet
            </Link>
            <nav className="flex gap-1 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
          Lærerrommet — et verktøy for tilbakemeldinger og undervisningsopplegg
        </footer>
      </body>
    </html>
  );
}
