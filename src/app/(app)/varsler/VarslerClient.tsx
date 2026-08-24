"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import type { NotificationItem } from "@/lib/types";

export function VarslerClient({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAsRead(notification: NotificationItem) {
    if (!notification.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
      fetch(`/api/varsler/${notification.id}`, { method: "PATCH" }).catch(() => {});
    }
    if (notification.link) {
      router.push(notification.link);
    }
  }

  async function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/varsler", { method: "PATCH" }).catch(() => {});
  }

  if (notifications.length === 0) {
    return <EmptyState icon={<Bell size={32} />} title="Ingen varsler ennå" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {unreadCount > 0 && (
        <Button variant="secondary" size="sm" onClick={markAllAsRead} className="self-end">
          <CheckCheck size={16} /> Marker alle som lest
        </Button>
      )}
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-card border border-line bg-background shadow-card">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => markAsRead(notification)}
              className={cn(
                "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-background-subtle",
                !notification.read && "bg-primary/5"
              )}
            >
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  !notification.read ? "bg-primary" : "bg-transparent"
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{notification.title}</p>
                <p className="text-sm text-foreground/60">{notification.message}</p>
                <p className="mt-1 text-xs text-foreground/40">
                  {new Intl.DateTimeFormat("nb-NO", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(notification.createdAt))}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
