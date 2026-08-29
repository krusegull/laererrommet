"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  NotebookPen,
  UserRound,
  MessageCircle,
  ThumbsUp,
  Settings,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/cn";

const PRIMARY_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/veileder", label: "KI-veilederen", icon: Sparkles },
  { href: "/logg", label: "Tilbakemeldingslogg", icon: NotebookPen },
  { href: "/undervisningsbanken", label: "Undervisningsbanken", icon: BookOpen },
  { href: "/meg", label: "Meg", icon: UserRound },
];

const SECONDARY_LINKS = [
  { href: "/meldinger", label: "Meldinger", icon: MessageCircle },
  { href: "/onsker", label: "Ønsker", icon: ThumbsUp },
  { href: "/profil", label: "Min profil", icon: UserRound },
  { href: "/innstillinger", label: "Innstillinger", icon: Settings },
];

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname?.startsWith(href + "/");
  }

  return (
    <aside className="hidden w-56 shrink-0 border-r border-line bg-background px-3 py-6 md:block">
      <nav className="flex flex-col gap-1">
        {PRIMARY_LINKS.map((link) => (
          <SidebarLink key={link.href} {...link} active={isActive(link.href)} />
        ))}
      </nav>

      <div className="my-4 border-t border-line" />

      <nav className="flex flex-col gap-1">
        {SECONDARY_LINKS.map((link) => (
          <SidebarLink key={link.href} {...link} active={isActive(link.href)} />
        ))}
        {isAdmin && (
          <SidebarLink href="/admin" label="Admin" icon={ShieldCheck} active={isActive("/admin")} />
        )}
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-button px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground/70 hover:bg-background-subtle hover:text-foreground"
      )}
    >
      <Icon size={18} strokeWidth={2} />
      {label}
    </Link>
  );
}
