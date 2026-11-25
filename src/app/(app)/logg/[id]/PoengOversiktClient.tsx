"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, Star, Trash2, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { PoengOversikt, PoengRad } from "@/lib/poeng/types";

const fmtDate = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", year: "numeric" });
const signed = (n: number) => (n > 0 ? "+" : "") + n;

function hvorFra(r: PoengRad): string {
  return [r.konkurranse ? "🏆 " + r.konkurranse : "", r.kilde, r.gruppe, r.klasse].filter(Boolean).join(" · ") || "–";
}

function RadTabell({
  rader,
  visFag,
  onDelete,
  deleting,
}: {
  rader: PoengRad[];
  visFag?: boolean;
  onDelete: (id: string) => void;
  deleting: string | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-foreground/50">
            <th className="py-1.5 pr-3 font-semibold">Dato</th>
            <th className="py-1.5 pr-3 font-semibold">Poeng</th>
            {visFag && <th className="py-1.5 pr-3 font-semibold">Fag</th>}
            <th className="py-1.5 pr-3 font-semibold">Periode/tema</th>
            <th className="py-1.5 pr-3 font-semibold">Hvor fra</th>
            <th className="py-1.5" />
          </tr>
        </thead>
        <tbody>
          {rader.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0">
              <td className="whitespace-nowrap py-1.5 pr-3">{fmtDate.format(new Date(r.dato))}</td>
              <td className={cn("py-1.5 pr-3 font-semibold", r.poeng < 0 ? "text-error" : "text-success")}>
                {signed(r.poeng)}
              </td>
              {visFag && <td className="py-1.5 pr-3">{r.fag}</td>}
              <td className="py-1.5 pr-3">{r.tema}</td>
              <td className="py-1.5 pr-3 text-foreground/70">{hvorFra(r)}</td>
              <td className="py-1.5 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
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
  );
}

function Tall({ label, value, tone }: { label: string; value: string | number; tone?: "good" | "bad" }) {
  return (
    <div className="flex min-w-[96px] flex-col rounded-button border border-line px-3 py-2">
      <span className="text-xs font-medium text-foreground/60">{label}</span>
      <span className={cn("text-lg font-bold", tone === "good" && "text-success", tone === "bad" && "text-error")}>{value}</span>
    </div>
  );
}

export function PoengOversiktClient({ oversikt }: { oversikt: PoengOversikt }) {
  const router = useRouter();
  const { fag, atferd, konkurranser } = oversikt;
  const [open, setOpen] = useState<string | null>(fag[0]?.fag ?? null);
  const [visAtferd, setVisAtferd] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const total = fag.reduce((s, f) => s + f.sum, 0);

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
    <div className="flex flex-col gap-4">
      <Card
        header={
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <Star size={16} /> Faglige poeng per fag
            </h2>
            {fag.length > 0 && <span className="text-sm font-semibold text-foreground/70">Totalt {total} p</span>}
          </div>
        }
      >
        {fag.length === 0 ? (
          <p className="text-sm text-foreground/60">
            Ingen faglige poeng ennå. Gi poeng under Klassekart → Poeng, eller send resultater fra en konkurranse.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {fag.map((f) => (
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
            {fag
              .filter((f) => f.fag === open)
              .map((f) => (
                <div key={f.fag} className="flex flex-col gap-3">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/50">Per periode/tema</p>
                    <div className="flex flex-wrap gap-2">
                      {f.temaer.map((t) => (
                        <span key={t.tema} className="rounded-full bg-background-subtle px-3 py-1 text-sm text-foreground">
                          {t.tema}: <strong>{t.sum} p</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                  <RadTabell rader={f.rader} onDelete={remove} deleting={deleting} />
                </div>
              ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          header={
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <Trophy size={16} /> Konkurranser
            </h2>
          }
        >
          {konkurranser.antall === 0 ? (
            <p className="text-sm text-foreground/60">Eleven har ikke fått poeng fra en konkurranse ennå.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Tall label="Konkurranser" value={konkurranser.antall} />
                <Tall label="Seire" value={konkurranser.seire} />
                <Tall label="Topp 3" value={konkurranser.pallplasser} />
                <Tall label="Snittplass" value={konkurranser.snittPlassering ?? "–"} />
                <Tall label="Faglige poeng" value={konkurranser.faglig} />
                <Tall
                  label="Atferd i konk."
                  value={signed(konkurranser.atferd)}
                  tone={konkurranser.atferd > 0 ? "good" : konkurranser.atferd < 0 ? "bad" : undefined}
                />
              </div>
              <ul className="flex flex-col gap-1.5 text-sm">
                {konkurranser.deltakelser.map((d, i) => (
                  <li key={i} className="flex items-start justify-between gap-2 border-b border-line pb-1.5 last:border-0">
                    <div>
                      <p className="font-medium text-foreground">
                        {d.plassering ? d.plassering + ". plass · " : ""}
                        {d.konkurranse}
                      </p>
                      <p className="text-xs text-foreground/60">
                        {fmtDate.format(new Date(d.dato))} · {d.fag} · {d.tema}
                        {d.gruppe ? " · " + d.gruppe : ""}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-xs">
                      <span className="font-semibold text-success">{d.faglig} p</span>
                      {d.atferd !== 0 && (
                        <span className={cn("ml-2 font-semibold", d.atferd < 0 ? "text-error" : "text-success")}>
                          atferd {signed(d.atferd)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card
          header={
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <Scale size={16} /> Atferd
              </h2>
              <span className="text-xs text-foreground/50">Holdes utenfor faglige poeng</span>
            </div>
          }
        >
          {atferd.rader.length === 0 ? (
            <p className="text-sm text-foreground/60">Ingen atferdspoeng registrert.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Tall label="Sum" value={signed(atferd.sum)} tone={atferd.sum > 0 ? "good" : atferd.sum < 0 ? "bad" : undefined} />
                <Tall label="Pluss" value={signed(atferd.pluss)} tone="good" />
                <Tall label="Minus" value={atferd.minus} tone={atferd.minus < 0 ? "bad" : undefined} />
                <Tall label="I konkurranser" value={signed(atferd.iKonkurranse)} />
              </div>
              <button
                type="button"
                onClick={() => setVisAtferd(!visAtferd)}
                className="self-start text-sm font-medium text-primary hover:underline"
              >
                {visAtferd ? "Skjul registreringer" : `Vis alle ${atferd.rader.length} registreringer`}
              </button>
              {visAtferd && <RadTabell rader={atferd.rader} visFag onDelete={remove} deleting={deleting} />}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
