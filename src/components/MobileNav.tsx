"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, NotebookPen, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/veileder", label: "Veileder", icon: Sparkles },
  { href: "/logg", label: "Logg", icon: NotebookPen },
  { href: "/meg", label: "Meg", icon: UserRound },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname?.startsWith(link.href + "/");
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium",
              active ? "text-primary" : "text-foreground/50"
            )}
          >
            <Icon size={20} strokeWidth={2} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
