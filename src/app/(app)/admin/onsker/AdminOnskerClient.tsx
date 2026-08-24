"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface Item {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  authorName: string;
  voteCount: number;
}

const STATUSES = ["innsendt", "under vurdering", "planlagt", "realisert"];

export function AdminOnskerClient({ initialRequests }: { initialRequests: Item[] }) {
  const [requests, setRequests] = useState(initialRequests);

  async function updateStatus(id: string, status: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch(`/api/admin/onsker/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }

  if (requests.length === 0) {
    return <EmptyState icon={<ThumbsUp size={32} />} title="Ingen ønsker sendt inn ennå" />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {requests.map((item) => (
        <li key={item.id}>
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <Badge variant="neutral">{item.category}</Badge>
                  <Badge variant="primary">{item.voteCount} stemmer</Badge>
                </div>
                {item.description && (
                  <p className="mt-1 text-sm text-foreground/70">{item.description}</p>
                )}
                <p className="mt-2 text-xs text-foreground/40">Foreslått av {item.authorName}</p>
              </div>
              <select
                value={item.status}
                onChange={(e) => updateStatus(item.id, e.target.value)}
                className="shrink-0 rounded-button border border-line bg-background px-2 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
