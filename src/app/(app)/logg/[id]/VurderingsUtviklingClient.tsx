"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { computeTrend } from "@/lib/vurdering/trend";
import { resolveKarakter } from "@/lib/vurdering/karakter";
import type { SkalaEntry } from "@/lib/vurdering/types";

interface MalOversiktProps {
  malId: string;
  malName: string;
  skala: SkalaEntry[];
  entries: { dato: string; score: number; karakter: string | null }[];
  cohortAverage: number | null;
  maal: { elevMaal: string | null; laererMaal: string | null; notat: string | null } | null;
}

const TREND_LABEL = {
  oppadgaende: { label: "Oppadgående", icon: TrendingUp, cls: "text-success" },
  nedadgaende: { label: "Nedadgående - følg opp", icon: TrendingDown, cls: "text-error" },
  stabil: { label: "Stabil", icon: Minus, cls: "text-foreground/50" },
} as const;

function MiniChart({ entries, cohortAverage }: { entries: { dato: string; score: number }[]; cohortAverage: number | null }) {
  const W = 320;
  const H = 110;
  const PAD = 10;
  const n = entries.length;
  const x = (i: number) => (n <= 1 ? W / 2 : PAD + (i / (n - 1)) * (W - 2 * PAD));
  const y = (score: number) => PAD + (1 - score / 100) * (H - 2 * PAD);
  const points = entries.map((e, i) => `${x(i)},${y(e.score)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full">
      {cohortAverage != null && (
        <line
          x1={0}
          x2={W}
          y1={y(cohortAverage)}
          y2={y(cohortAverage)}
          strokeDasharray="4 3"
          className="stroke-foreground/25"
        />
      )}
      {n > 1 && <polyline points={points} fill="none" strokeWidth={2} className="stroke-primary" />}
      {entries.map((e, i) => (
        <circle key={i} cx={x(i)} cy={y(e.score)} r={3.5} className="fill-primary">
          <title>
            {new Date(e.dato).toLocaleDateString("nb-NO")}: {e.score} p
          </title>
        </circle>
      ))}
    </svg>
  );
}

function MalCard({ oversikt, studentId }: { oversikt: MalOversiktProps; studentId: string }) {
  const { malId, malName, skala, entries, cohortAverage, maal } = oversikt;
  const [elevMaal, setElevMaal] = useState(maal?.elevMaal ?? "");
  const [laererMaal, setLaererMaal] = useState(maal?.laererMaal ?? "");
  const [notat, setNotat] = useState(maal?.notat ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const scores = entries.map((e) => e.score);
  const trend = computeTrend(scores);
  const latest = entries[entries.length - 1];
  const latestKarakter = latest ? resolveKarakter(latest.score, skala) : null;
  const classAvgKarakter = cohortAverage != null ? resolveKarakter(Math.round(cohortAverage), skala) : null;

  const malTarget = laererMaal || elevMaal;
  const targetEntry = malTarget ? skala.find((s) => s.label === malTarget) : null;
  const distanceToGoal = targetEntry && latest ? targetEntry.minScore - latest.score : null;

  async function saveMaal() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/vurdering/maal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, malId, elevMaal: elevMaal || null, laererMaal: laererMaal || null, notat: notat || null }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const trendInfo = trend ? TREND_LABEL[trend] : null;

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{malName}</h3>
          {trendInfo && (
            <span className={cn("flex items-center gap-1 text-xs font-medium", trendInfo.cls)}>
              <trendInfo.icon size={14} /> {trendInfo.label}
            </span>
          )}
        </div>

        <MiniChart entries={entries} cohortAverage={cohortAverage} />

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/60">
          {latest && (
            <span>
              Siste: <strong className="text-foreground">{latest.score} p{latestKarakter ? " (karakter " + latestKarakter + ")" : ""}</strong>
            </span>
          )}
          {cohortAverage != null && (
            <span>
              Snitt blant dine elever på denne malen: {Math.round(cohortAverage)} p
              {classAvgKarakter ? " (karakter " + classAvgKarakter + ")" : ""}
            </span>
          )}
          <span>{entries.length} vurdering{entries.length === 1 ? "" : "er"}</span>
        </div>

        {distanceToGoal !== null && (
          <p className={cn("text-sm font-medium", distanceToGoal <= 0 ? "text-success" : "text-foreground")}>
            {distanceToGoal <= 0
              ? `Eleven er allerede på eller over målet (karakter ${malTarget}).`
              : `${distanceToGoal} poeng igjen til karakter ${malTarget}.`}
          </p>
        )}

        <div className="grid gap-2 border-t border-line pt-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Elevens mål</span>
            {skala.length > 0 ? (
              <select
                value={elevMaal}
                onChange={(e) => setElevMaal(e.target.value)}
                className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Ikke satt</option>
                {skala.map((s) => (
                  <option key={s.label} value={s.label}>
                    {s.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={elevMaal}
                onChange={(e) => setElevMaal(e.target.value)}
                placeholder="F.eks. karakter 5"
                className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Lærerens realistiske mål</span>
            {skala.length > 0 ? (
              <select
                value={laererMaal}
                onChange={(e) => setLaererMaal(e.target.value)}
                className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Ikke satt</option>
                {skala.map((s) => (
                  <option key={s.label} value={s.label}>
                    {s.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={laererMaal}
                onChange={(e) => setLaererMaal(e.target.value)}
                placeholder="F.eks. karakter 4"
                className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-foreground">Notat (valgfritt)</span>
            <textarea
              value={notat}
              onChange={(e) => setNotat(e.target.value)}
              rows={2}
              placeholder="F.eks. hvorfor dette målet er satt, eller om det bør justeres"
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" onClick={saveMaal} loading={saving}>
            Lagre mål
          </Button>
          {saved && <span className="text-sm text-success">Lagret</span>}
        </div>
      </div>
    </Card>
  );
}

export function VurderingsUtviklingClient({
  studentId,
  oversikt,
}: {
  studentId: string;
  oversikt: MalOversiktProps[];
}) {
  if (oversikt.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-foreground">Vurderingsutvikling</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {oversikt.map((o) => (
          <MalCard key={o.malId} oversikt={o} studentId={studentId} />
        ))}
      </div>
    </div>
  );
}
