"use client";

import { useMemo, useState } from "react";
import { Award, Eye, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { Grupper, Pod, PodSeats, StudentLite } from "@/lib/klassekart/types";
import { FORSLAG_KATEGORIER } from "@/lib/vurdering/types";
import { PresentationOverlay } from "./PresentationOverlay";

type Mode = "random" | "manuell" | "instruks";

interface RunResult {
  grupper: Grupper;
  warnings: string[];
  aiFallback?: boolean;
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Noe gikk feil");
  }
}

export function GrupperEditor({
  classId,
  className,
  students,
  grupper,
  onRun,
}: {
  classId: string;
  className: string;
  students: StudentLite[];
  grupper: Grupper;
  onRun: (payload: {
    mode: Mode;
    size?: number;
    instruks?: string;
    manualGroups?: string[][];
  }) => Promise<RunResult>;
}) {
  const [mode, setMode] = useState<Mode>("random");
  const [size, setSize] = useState(4);
  const [instruks, setInstruks] = useState("");
  const [manualGroupTexts, setManualGroupTexts] = useState<string[]>(["", ""]);
  const [result, setResult] = useState<RunResult>({ grupper, warnings: [] });
  const [running, setRunning] = useState(false);
  const [presentOpen, setPresentOpen] = useState(false);

  const [poengGroupIndex, setPoengGroupIndex] = useState<number | null>(null);
  const [poengKategori, setPoengKategori] = useState("Gruppearbeid");
  const [poengBase, setPoengBase] = useState("10");
  const [poengPerStudent, setPoengPerStudent] = useState<Record<string, string>>({});
  const [poengBegrunnelse, setPoengBegrunnelse] = useState("");
  const [poengSaving, setPoengSaving] = useState(false);
  const [poengMessage, setPoengMessage] = useState<string | null>(null);

  // Grupper har ingen fysisk plassering i rommet - til presentasjonen bygger
  // vi derfor en "pod" per gruppe på sparket, kun for å gjenbruke samme
  // presentasjonsvisning som klassekartet (den bryr seg bare om rekkefølge,
  // ikke faktisk x/y).
  const groupPodLayout: Pod[] = result.grupper.map((g, i) => ({ id: i, size: g.length, x: 0, y: i }));
  const groupPods: PodSeats = result.grupper;
  const groupLabels = result.grupper.map((_, i) => "Gruppe " + (i + 1));

  const nameOf = new Map(students.map((s) => [s.id, s.name]));

  const nameToId = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of students) {
      const key = s.name.trim().toLowerCase();
      if (!map.has(key)) map.set(key, s.id);
    }
    return map;
  }, [students]);

  const manualResolved = useMemo(() => {
    const seen = new Set<string>();
    const unmatchedNames: string[] = [];
    const duplicateNames: string[] = [];
    const groups: string[][] = manualGroupTexts.map((text) => {
      const ids: string[] = [];
      for (const raw of text.split("\n")) {
        const name = raw.trim();
        if (!name) continue;
        const id = nameToId.get(name.toLowerCase());
        if (!id) {
          unmatchedNames.push(name);
          continue;
        }
        if (seen.has(id)) {
          duplicateNames.push(name);
          continue;
        }
        seen.add(id);
        ids.push(id);
      }
      return ids;
    });
    const unplaced = students.filter((s) => !seen.has(s.id));
    return { groups, unmatchedNames, duplicateNames, unplaced };
  }, [manualGroupTexts, nameToId, students]);

  async function runRandom() {
    setRunning(true);
    try {
      setResult(await onRun({ mode: "random", size }));
    } finally {
      setRunning(false);
    }
  }

  async function runInstruks() {
    if (!instruks.trim()) return;
    setRunning(true);
    try {
      setResult(await onRun({ mode: "instruks", instruks, size }));
    } finally {
      setRunning(false);
    }
  }

  async function saveManual() {
    const nonEmpty = manualResolved.groups.filter((g) => g.length > 0);
    setRunning(true);
    try {
      setResult(await onRun({ mode: "manuell", manualGroups: nonEmpty }));
    } finally {
      setRunning(false);
    }
  }

  function openPoengPanel(groupIndex: number) {
    const members = result.grupper[groupIndex] ?? [];
    setPoengGroupIndex(groupIndex);
    setPoengKategori("Gruppearbeid");
    setPoengBase("10");
    setPoengPerStudent(Object.fromEntries(members.map((id) => [id, "10"])));
    setPoengBegrunnelse("");
    setPoengMessage(null);
  }

  function fillAllPoeng(value: string) {
    setPoengBase(value);
    setPoengPerStudent((prev) => Object.fromEntries(Object.keys(prev).map((id) => [id, value])));
  }

  async function savePoeng() {
    if (poengGroupIndex == null) return;
    const members = result.grupper[poengGroupIndex] ?? [];
    if (!poengKategori.trim() || members.length === 0) return;
    setPoengSaving(true);
    try {
      await Promise.all(
        members.map((id) => {
          const raw = poengPerStudent[id];
          const poeng = raw === undefined || raw.trim() === "" ? undefined : Number(raw);
          return postJson("/api/vurdering/utmerkelser", {
            classId,
            classStudentId: id,
            kategori: poengKategori.trim(),
            begrunnelse: poengBegrunnelse.trim() || undefined,
            poeng,
          });
        })
      );
      setPoengMessage(`Lagt til i Topp 5-oversikten for ${members.length} elever.`);
      setPoengGroupIndex(null);
    } catch (e) {
      setPoengMessage(e instanceof Error ? e.message : "Klarte ikke å lagre poeng for gruppa");
    } finally {
      setPoengSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="inline-flex rounded-button border border-line p-0.5">
        {(["random", "manuell", "instruks"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-[5px] px-3 py-1.5 text-sm font-medium",
              mode === m ? "bg-primary text-white" : "text-foreground/70"
            )}
          >
            {m === "random" ? "Randomiser" : m === "manuell" ? "Lag selv" : "Gi instruks"}
          </button>
        ))}
      </div>

      {mode === "random" && (
        <div className="flex items-end gap-2">
          <Input
            label="Elever per gruppe"
            type="number"
            min={2}
            max={10}
            value={size}
            onChange={(e) => setSize(Number(e.target.value) || 2)}
            className="w-32"
          />
          <Button type="button" onClick={runRandom} loading={running}>
            Lag grupper nå
          </Button>
        </div>
      )}

      {mode === "instruks" && (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Instruks til KI-en</span>
            <textarea
              value={instruks}
              onChange={(e) => setInstruks(e.target.value)}
              rows={3}
              placeholder="F.eks. «Del inn i grupper på 3 der ingen har jobbet sammen før» eller «lag grupper der alle gruppene har minst én som er sterk i matte»"
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <Button type="button" onClick={runInstruks} loading={running} disabled={!instruks.trim()}>
            <Sparkles size={14} /> Lag grupper fra instruks
          </Button>
          {result.aiFallback && (
            <p className="text-sm text-foreground/60">
              KI-en var ikke tilgjengelig akkurat nå, så gruppene ble randomisert i stedet.
            </p>
          )}
        </div>
      )}

      {mode === "manuell" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-foreground/60">
            Skriv eller lim inn ett elevnavn per linje i hver gruppe - navnet må skrives akkurat som i
            elevlisten.
          </p>
          <div className="flex flex-wrap gap-3">
            {manualGroupTexts.map((text, i) => (
              <div key={i} className="flex w-44 flex-col gap-1">
                <p className="text-xs font-medium text-foreground/50">Gruppe {i + 1}</p>
                <textarea
                  value={text}
                  onChange={(e) =>
                    setManualGroupTexts((prev) => prev.map((t, idx) => (idx === i ? e.target.value : t)))
                  }
                  rows={5}
                  placeholder="Ett navn per linje"
                  className="rounded-button border border-line bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setManualGroupTexts((prev) => [...prev, ""])}
              className="flex w-28 items-center justify-center gap-1 self-stretch rounded-card border border-line text-sm text-foreground/60 hover:border-primary hover:text-primary"
            >
              <Plus size={14} /> Ny gruppe
            </button>
          </div>

          {manualResolved.unplaced.length > 0 && (
            <p className="text-sm text-foreground/60">
              Ikke plassert ({manualResolved.unplaced.length}):{" "}
              {manualResolved.unplaced.map((s) => s.name).join(", ")}
            </p>
          )}
          {manualResolved.unmatchedNames.length > 0 && (
            <p className="text-sm text-error">
              Fant ikke igjen disse navnene i elevlisten: {manualResolved.unmatchedNames.join(", ")}
            </p>
          )}
          {manualResolved.duplicateNames.length > 0 && (
            <p className="text-sm text-error">
              Disse står i flere grupper og ble bare lagt til i den første:{" "}
              {manualResolved.duplicateNames.join(", ")}
            </p>
          )}

          <Button type="button" onClick={saveManual} loading={running} className="self-start">
            Lagre grupper
          </Button>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">Siste gruppeinndeling</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPresentOpen(true)}
            disabled={result.grupper.length === 0}
          >
            <Eye size={14} /> Vis til elevene
          </Button>
        </div>
        {result.grupper.length === 0 ? (
          <p className="text-sm text-foreground/50">Ingen grupper laget ennå.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {result.grupper.map((group, i) => (
              <Card key={i} className="min-w-[140px]">
                <div className="flex items-center justify-between gap-2">
                  <p className="mb-1 text-xs font-medium text-foreground/50">Gruppe {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => openPoengPanel(i)}
                    className="mb-1 text-foreground/40 hover:text-primary"
                    aria-label={`Gi poeng til gruppe ${i + 1}`}
                  >
                    <Award size={14} />
                  </button>
                </div>
                <ul className="text-sm text-foreground">
                  {group.map((id) => (
                    <li key={id}>{nameOf.get(id) ?? "?"}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
        {result.warnings.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1 text-sm text-error">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}

        {poengGroupIndex != null && (
          <Card className="mt-3">
            <div className="flex flex-col gap-3">
              <p className="font-medium text-foreground">
                Gi poeng til Gruppe {poengGroupIndex + 1} (går inn i Topp 5-oversikten per elev)
              </p>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-foreground">Kategori</span>
                <input
                  list="poeng-kategorier"
                  value={poengKategori}
                  onChange={(e) => setPoengKategori(e.target.value)}
                  className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <datalist id="poeng-kategorier">
                  {FORSLAG_KATEGORIER.map((k) => (
                    <option key={k} value={k} />
                  ))}
                </datalist>
              </label>

              <div className="flex items-end gap-2">
                <Input
                  label="Poeng til alle"
                  type="number"
                  min={0}
                  max={1000}
                  value={poengBase}
                  onChange={(e) => fillAllPoeng(e.target.value)}
                  className="w-32"
                />
                <Button type="button" variant="secondary" size="sm" onClick={() => fillAllPoeng(poengBase)}>
                  Fyll alle
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                {(result.grupper[poengGroupIndex] ?? []).map((id) => (
                  <Input
                    key={id}
                    label={nameOf.get(id) ?? "?"}
                    type="number"
                    min={0}
                    max={1000}
                    value={poengPerStudent[id] ?? ""}
                    onChange={(e) => setPoengPerStudent((prev) => ({ ...prev, [id]: e.target.value }))}
                    className="w-28"
                  />
                ))}
              </div>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-foreground">Begrunnelse (valgfritt, gjelder alle i gruppa)</span>
                <textarea
                  value={poengBegrunnelse}
                  onChange={(e) => setPoengBegrunnelse(e.target.value)}
                  rows={2}
                  className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <div className="flex gap-2">
                <Button type="button" onClick={savePoeng} loading={poengSaving} disabled={!poengKategori.trim()}>
                  Lagre poeng
                </Button>
                <Button type="button" variant="secondary" onClick={() => setPoengGroupIndex(null)}>
                  Avbryt
                </Button>
              </div>
            </div>
          </Card>
        )}
        {poengMessage && <p className="mt-2 text-sm text-foreground/70">{poengMessage}</p>}
      </div>

      <PresentationOverlay
        open={presentOpen}
        onClose={() => setPresentOpen(false)}
        className={className}
        eyebrow="Grupper"
        roomObjects={[]}
        podLayout={groupPodLayout}
        pods={groupPods}
        students={students}
        podLabels={groupLabels}
      />
    </div>
  );
}
