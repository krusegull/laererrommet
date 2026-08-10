"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function Header({ userName }: { userName: string }) {
  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/dashboard" className="text-lg font-semibold text-primary">
          Lærerrommet
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-foreground/70 sm:inline">Hei, {userName}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-black/5"
          >
            Logg ut
          </button>
        </div>
      </div>
    </header>
  );
}
