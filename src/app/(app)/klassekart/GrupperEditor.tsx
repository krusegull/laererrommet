"use client";

import { useState } from "react";
import { Eye, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { Grupper, Pod, PodSeats, StudentLite } from "@/lib/klassekart/types";
import { PresentationOverlay } from "./PresentationOverlay";

type Mode = "random" | "manuell" | "instruks";

interface RunResult {
  grupper: Grupper;
  warnings: string[];
  aiFallback?: boolean;
}

export function GrupperEditor({
  className,
  students,
  grupper,
  onRun,
}: {
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
  const [manualGroups, setManualGroups] = useState<string[][]>([[], []]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult>({ grupper, warnings: [] });
  const [running, setRunning] = useState(false);
  const [presentOpen, setPresentOpen] = useState(false);

  // Grupper har ingen fysisk plassering i rommet - til presentasjonen bygger
  // vi derfor en "pod" per gruppe på sparket, kun for å gjenbruke samme
  // presentasjonsvisning som klassekartet (den bryr seg bare om rekkefølge,
  // ikke faktisk x/y).
  const groupPodLayout: Pod[] = result.grupper.map((g, i) => ({ id: i, size: g.length, x: 0, y: i }));
  const groupPods: PodSeats = result.grupper;
  const groupLabels = result.grupper.map((_, i) => "Gruppe " + (i + 1));

  const nameOf = new Map(students.map((s) => [s.id, s.name]));
  const assignedIds = new Set(manualGroups.flat());
  const pool = students.filter((s) => !assignedIds.has(s.id));

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
    const nonEmpty = manualGroups.filter((g) => g.length > 0);
    setRunning(true);
    try {
      setResult(await onRun({ mode: "manuell", manualGroups: nonEmpty }));
    } finally {
      setRunning(false);
    }
  }

  function assignToGroup(groupIndex: number) {
    if (!selectedStudent) return;
    setManualGroups((prev) => prev.map((g, i) => (i === groupIndex ? [...g, selectedStudent] : g)));
    setSelectedStudent(null);
  }

  function removeFromGroup(groupIndex: number, studentId: string) {
    setManualGroups((prev) => prev.map((g, i) => (i === groupIndex ? g.filter((id) => id !== studentId) : g)));
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
          <div className="flex flex-wrap gap-2">
            {pool.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStudent(s.id === selectedStudent ? null : s.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm",
                  selectedStudent === s.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-line text-foreground/70"
                )}
              >
                {s.name}
              </button>
            ))}
            {pool.length === 0 && <p className="text-sm text-foreground/50">Alle elever er plassert i en gruppe.</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            {manualGroups.map((group, i) => (
              <div
                key={i}
                onClick={() => assignToGroup(i)}
                className="min-w-[140px] cursor-pointer rounded-card border border-dashed border-line p-3"
              >
                <p className="mb-1 text-xs font-medium text-foreground/50">Gruppe {i + 1}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromGroup(i, id);
                      }}
                      className="rounded-full bg-background-subtle px-2 py-0.5 text-xs text-foreground/80"
                    >
                      {nameOf.get(id)} ×
                    </button>
                  ))}
                  {group.length === 0 && <p className="text-xs text-foreground/40">Klikk her for å legge til</p>}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setManualGroups((prev) => [...prev, []])}
              className="flex min-w-[100px] items-center justify-center gap-1 rounded-card border border-line text-sm text-foreground/60 hover:border-primary hover:text-primary"
            >
              <Plus size={14} /> Ny gruppe
            </button>
          </div>
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
                <p className="mb-1 text-xs font-medium text-foreground/50">Gruppe {i + 1}</p>
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
