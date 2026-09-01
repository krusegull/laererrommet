"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Bell } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { CALENDAR_CATEGORY_STYLES } from "@/lib/calendarColors";
import type { NotificationItem } from "@/lib/types";
import type { CALENDAR_CATEGORIES } from "@/lib/validations";

function calendarDotClass(type: string): string | null {
  if (!type.startsWith("kalender:")) return null;
  const category = type.slice("kalender:".length) as (typeof CALENDAR_CATEGORIES)[number];
  return CALENDAR_CATEGORY_STYLES[category]?.dot ?? "bg-fuchsia-500";
}

const MOBILE_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/veileder", label: "KI-veilederen" },
  { href: "/logg", label: "Tilbakemeldingslogg" },
  { href: "/undervisningsbanken", label: "Undervisningsbanken" },
  { href: "/meg", label: "Meg" },
  { href: "/kalender", label: "Kalender" },
  { href: "/meldinger", label: "Meldinger" },
  { href: "/onsker", label: "Ønsker" },
  { href: "/profil", label: "Min profil" },
  { href: "/innstillinger", label: "Innstillinger" },
];

export function Topbar({
  userName,
  unreadCount,
  isAdmin,
}: {
  userName: string;
  unreadCount: number;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const isDark = mounted && theme === "dark";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet: unngår hydration-mismatch for tema, jf. https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function openNotifications() {
    setNotifOpen((open) => !open);
    if (!notifications) {
      try {
        const res = await fetch("/api/varsler");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
        }
      } catch {
        // stille feil — bjellen viser bare tom liste
      }
    }
  }

  function goToNotification(notification: NotificationItem) {
    setNotifOpen(false);
    if (!notification.read) {
      fetch(`/api/varsler/${notification.id}`, { method: "PATCH" }).catch(() => {});
    }
    router.push(notification.link ?? "/varsler");
  }

  function toggleDarkMode() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    fetch("/api/innstillinger", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ darkMode: next === "dark" }),
    }).catch(() => {});
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-button bg-primary text-sm font-bold text-white">
            L
          </span>
          <span className="hidden sm:inline">Lærerrommet</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label="Bytt mørk/lys modus"
            className="hidden rounded-button p-2 text-foreground/60 hover:bg-background-subtle hover:text-foreground sm:inline-flex"
          >
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path
                  d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={openNotifications}
              aria-label="Varsler"
              className="relative rounded-button p-2 text-foreground/60 hover:bg-background-subtle hover:text-foreground"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-card border border-line bg-background p-2 shadow-card">
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  Varsler
                </p>
                {!notifications || notifications.length === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-foreground/50">
                    Ingen varsler ennå.
                  </p>
                ) : (
                  <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
                    {notifications.slice(0, 8).map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => goToNotification(n)}
                          className={cn(
                            "block w-full rounded-button px-2 py-2 text-left text-sm hover:bg-background-subtle",
                            !n.read && "bg-primary/5"
                          )}
                        >
                          <p className="flex items-center gap-1.5 font-medium text-foreground">
                            {calendarDotClass(n.type) && (
                              <Bell
                                size={12}
                                className={cn(
                                  "shrink-0 rounded-full p-0.5 text-white",
                                  calendarDotClass(n.type)
                                )}
                              />
                            )}
                            {n.title}
                          </p>
                          <p className="text-foreground/60">{n.message}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href="/varsler"
                  onClick={() => setNotifOpen(false)}
                  className="mt-1 block rounded-button px-2 py-2 text-center text-sm font-medium text-primary hover:bg-background-subtle"
                >
                  Se alle varsler
                </Link>
              </div>
            )}
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Avatar name={userName} size="sm" />
            <span className="text-sm font-medium text-foreground">{userName}</span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-button px-2 py-1.5 text-sm text-foreground/60 hover:bg-background-subtle hover:text-foreground"
            >
              Logg ut
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Meny"
            className="rounded-button p-2 text-foreground/70 hover:bg-background-subtle md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-background px-4 py-3 md:hidden">
          <div className="flex items-center gap-2 pb-3">
            <Avatar name={userName} size="sm" />
            <span className="text-sm font-medium text-foreground">{userName}</span>
          </div>
          <nav className="flex flex-col gap-1">
            {MOBILE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-button px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-background-subtle"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="rounded-button px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-background-subtle"
              >
                Admin
              </Link>
            )}
          </nav>
          <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="rounded-button px-3 py-2 text-sm text-foreground/70 hover:bg-background-subtle"
            >
              {isDark ? "Lys modus" : "Mørk modus"}
            </button>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-button px-3 py-2 text-sm text-error hover:bg-error/5"
            >
              Logg ut
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
