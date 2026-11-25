"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { FagOversikt } from "@/lib/poeng/types";

const fmtDate = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", year: "numeric" });

export function PoengOversiktClient({ oversikt }: { oversikt: FagOversikt[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(oversikt[0]?.fag ?? null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const total = oversikt.reduce((s, f) => s + f.sum, 0);

  async function remove(id: string) {
    if (!confirm("Slette denne poengregistreringen for eleven?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/poeng/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <Card
      header={
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <Star size={16} /> Poeng per fag
          </h2>
          {oversikt.length > 0 && <span className="text-sm font-semibold text-foreground/70">Totalt {total} p</span>}
        </div>
      }
    >
      {oversikt.length === 0 ? (
        <p className="text-sm text-foreground/60">
          Ingen poeng ennå. Gi plusspoeng til elever og grupper under Klassekart → Poeng.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {oversikt.map((f) => (
              <button
                key={f.fag}
                type="button"
                onClick={() => setOpen(open === f.fag ? null : f.fag)}
                className={cn(
                  "flex min-w-[120px] flex-col items-start rounded-button border px-3 py-2 text-left transition-colors",
                  open === f.fag ? "border-primary bg-primary/5" : "border-line hover:bg-background-subtle"
                )}
              >
                <span className="text-xs font-medium text-foreground/60">{f.fag}</span>
                <span className="text-lg font-bold text-foreground">{f.sum} p</span>
                <span className="text-xs text-foreground/50">
                  {f.antall} {f.antall === 1 ? "registrering" : "registreringer"}
                </span>
              </button>
            ))}
          </div>

          {oversikt
            .filter((f) => f.fag === open)
            .map((f) => (
              <div key={f.fag} className="flex flex-col gap-3">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/50">
                    Per periode/tema
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {f.temaer.map((t) => (
                      <span key={t.tema} className="rounded-full bg-background-subtle px-3 py-1 text-sm text-foreground">
                        {t.tema}: <strong>{t.sum} p</strong>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-xs uppercase tracking-wide text-foreground/50">
                        <th className="py-1.5 pr-3 font-semibold">Dato</th>
                        <th className="py-1.5 pr-3 font-semibold">Poeng</th>
                        <th className="py-1.5 pr-3 font-semibold">Periode/tema</th>
                        <th className="py-1.5 pr-3 font-semibold">Hvor fra</th>
                        <th className="py-1.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {f.rader.map((r) => (
                        <tr key={r.id} className="border-b border-line last:border-0">
                          <td className="whitespace-nowrap py-1.5 pr-3">{fmtDate.format(new Date(r.dato))}</td>
                          <td className={cn("py-1.5 pr-3 font-semibold", r.poeng < 0 ? "text-error" : "text-success")}>
                            {r.poeng > 0 ? "+" : ""}
                            {r.poeng}
                          </td>
                          <td className="py-1.5 pr-3">{r.tema}</td>
                          <td className="py-1.5 pr-3 text-foreground/70">
                            {[r.kilde, r.gruppe, r.klasse].filter(Boolean).join(" · ") || "–"}
                          </td>
                          <td className="py-1.5 text-right">
                            <button
                              type="button"
                              onClick={() => remove(r.id)}
                              disabled={deleting === r.id}
                              className="text-foreground/40 hover:text-error disabled:opacity-50"
                              aria-label="Slett registrering"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      )}
    </Card>
  );
}
