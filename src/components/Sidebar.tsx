"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, NotebookPen, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/veileder", label: "KI-veilederen", icon: Sparkles },
  { href: "/logg", label: "Tilbakemeldingslogg", icon: NotebookPen },
  { href: "/meg", label: "Meg", icon: UserRound },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-line bg-background px-3 py-6 md:block">
      <nav className="flex flex-col gap-1">
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname?.startsWith(link.href + "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-button px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-background-subtle hover:text-foreground"
              )}
            >
              <Icon size={18} strokeWidth={2} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
