import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Lightbulb, AlertTriangle, ThumbsUp, Users, ScrollText } from "lucide-react";
import { requireAdminPage } from "@/lib/requireAdmin";

const ADMIN_LINKS = [
  { href: "/admin", label: "Oversikt", icon: LayoutDashboard },
  { href: "/admin/ideer", label: "Ideer", icon: Lightbulb },
  { href: "/admin/idebank", label: "Idébank", icon: ScrollText },
  { href: "/admin/feil", label: "Feilrapporter", icon: AlertTriangle },
  { href: "/admin/onsker", label: "Ønsker", icon: ThumbsUp },
  { href: "/admin/brukere", label: "Brukere", icon: Users },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin</h1>
        <p className="mt-1 text-foreground/60">Kun synlig for administratorer.</p>
      </div>
      <nav className="flex flex-wrap gap-1 border-b border-line pb-px">
        {ADMIN_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-1.5 rounded-t-button px-3 py-2 text-sm font-medium text-foreground/60 hover:bg-background-subtle hover:text-foreground"
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
