"use client";

import { useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface ErrorReportItem {
  id: string;
  page: string;
  description: string;
  error: string | null;
  status: string;
  userEmail: string;
  userName: string;
  createdAt: string;
}

export function FeilClient({ initialReports }: { initialReports: ErrorReportItem[] }) {
  const [reports, setReports] = useState(initialReports);

  async function markResolved(id: string) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "løst" } : r)));
    await fetch(`/api/admin/feil/${id}`, { method: "PATCH" }).catch(() => {});
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={<ShieldCheck size={32} />}
        title="Ingen feilrapporter"
        description="Fint — ingenting å se her."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((report) => (
        <li key={report.id}>
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-background-subtle px-1.5 py-0.5 text-xs text-foreground/70">
                    {report.page}
                  </code>
                  <Badge variant={report.status === "løst" ? "success" : "neutral"}>
                    {report.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-foreground">{report.description}</p>
                {report.error && (
                  <p className="mt-1 truncate text-xs text-foreground/40">{report.error}</p>
                )}
                <p className="mt-2 text-xs text-foreground/50">
                  {report.userName} ({report.userEmail}) ·{" "}
                  {new Intl.DateTimeFormat("nb-NO", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(report.createdAt))}
                </p>
              </div>
              {report.status !== "løst" && (
                <Button size="sm" variant="secondary" onClick={() => markResolved(report.id)}>
                  <Check size={16} /> Marker som løst
                </Button>
              )}
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
