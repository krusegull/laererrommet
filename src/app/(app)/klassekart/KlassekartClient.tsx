"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { cn } from "@/lib/cn";
import type { Gender, Pod, RoomObject } from "@/lib/klassekart/types";
import type { IMAGE_MEDIA_TYPES } from "@/lib/validations";
import type { ChartDetail, ChartSummary, ClassDetail, ClassSummary, TabKey } from "./types";
import { RoomEditor } from "./RoomEditor";
import { PodEditor } from "./PodEditor";
import { RosterEditor } from "./RosterEditor";
import { SeatingView } from "./SeatingView";
import { GrupperEditor } from "./GrupperEditor";
import { PresentationOverlay } from "./PresentationOverlay";
import { ShareOverlay } from "./ShareOverlay";

const TABS: { key: TabKey; label: string }[] = [
  { key: "rom", label: "Rom" },
  { key: "pulter", label: "Pulter" },
  { key: "elever", label: "Elever" },
  { key: "kart", label: "Klassekart" },
  { key: "grupper", label: "Lag grupper" },
];

function currentIsoWeek(): number {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function chartLabel(chart: { label: string; week: number | null; year: number | null }): string {
  if (chart.week) return "Uke " + chart.week + (chart.year ? " (" + chart.year + ")" : "");
  return chart.label;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Noe gikk feil");
  return data;
}

export function KlassekartClient() {
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [chart, setChart] = useState<ChartDetail | null>(null);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [tab, setTab] = useState<TabKey>("rom");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newChartOpen, setNewChartOpen] = useState(false);
  const [newChartWeek, setNewChartWeek] = useState<string>(() => String(currentIsoWeek()));
  const [newChartYear, setNewChartYear] = useState<string>(() => String(new Date().getFullYear()));
  const [renamingChartId, setRenamingChartId] = useState<string | null>(null);
  const [presentOpen, setPresentOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<{ classes: ClassSummary[] }>("/api/klassekart")
      .then((data) => {
        setClasses(data.classes);
        if (data.classes.length > 0) setSelectedId(data.classes[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingClasses(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet henting ved valg av klasse, jf. https://react.dev/reference/react/useEffect#fetching-data-with-effects
    setLoadingDetail(true);
    fetchJson<{ class: ClassDetail }>(`/api/klassekart/${selectedId}`)
      .then((data) => {
        setDetail(data.class);
        setSelectedChartId(data.class.charts[0]?.id ?? null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId || !selectedChartId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet nullstilling når det ikke finnes et valgt kart
      setChart(null);
      return;
    }
    setLoadingChart(true);
    fetchJson<{ chart: ChartDetail }>(`/api/klassekart/${selectedId}/charts/${selectedChartId}`)
      .then((data) => setChart(data.chart))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingChart(false));
  }, [selectedId, selectedChartId]);

  async function handleAddClass() {
    try {
      const data = await fetchJson<{ class: ClassSummary }>("/api/klassekart", {
        method: "POST",
        body: JSON.stringify({ name: "Ny klasse" }),
      });
      setClasses((prev) => [...prev, data.class]);
      setSelectedId(data.class.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å legge til klassen");
    }
  }

  async function handleRenameClass(id: string, name: string) {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    if (detail?.id === id) setDetail((prev) => (prev ? { ...prev, name } : prev));
    try {
      await fetchJson(`/api/klassekart/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre navnet");
    }
  }

  async function handleDeleteClass(id: string) {
    if (!window.confirm("Slette denne klassen? Dette fjerner også elevlisten og alle klassekart.")) return;
    try {
      await fetchJson(`/api/klassekart/${id}`, { method: "DELETE" });
      setClasses((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (selectedId === id) setSelectedId(next[0]?.id ?? null);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å slette klassen");
    }
  }

  async function handleAddChart() {
    if (!detail) return;
    const week = newChartWeek.trim() ? Number(newChartWeek) : undefined;
    const year = newChartYear.trim() ? Number(newChartYear) : undefined;
    try {
      const data = await fetchJson<{ chart: ChartSummary }>(`/api/klassekart/${detail.id}/charts`, {
        method: "POST",
        body: JSON.stringify({ week, year, cloneFromChartId: selectedChartId ?? undefined }),
      });
      setDetail((prev) => (prev ? { ...prev, charts: [data.chart, ...prev.charts] } : prev));
      setSelectedChartId(data.chart.id);
      setNewChartOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lage nytt klassekart");
    }
  }

  async function handleRenameChart(chartId: string, patch: { week?: number | null; year?: number | null }) {
    if (!detail) return;
    try {
      const data = await fetchJson<{ chart: ChartSummary }>(`/api/klassekart/${detail.id}/charts/${chartId}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setDetail((prev) =>
        prev ? { ...prev, charts: prev.charts.map((c) => (c.id === chartId ? data.chart : c)) } : prev
      );
      if (chart?.id === chartId) {
        setChart((prev) => (prev ? { ...prev, week: data.chart.week, year: data.chart.year, label: data.chart.label } : prev));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre uken");
    }
    setRenamingChartId(null);
  }

  async function handleDeleteChart(chartId: string) {
    if (!detail) return;
    if (!window.confirm("Slette dette klassekartet?")) return;
    try {
      await fetchJson(`/api/klassekart/${detail.id}/charts/${chartId}`, { method: "DELETE" });
      setDetail((prev) => {
        if (!prev) return prev;
        const nextCharts = prev.charts.filter((c) => c.id !== chartId);
        if (selectedChartId === chartId) setSelectedChartId(nextCharts[0]?.id ?? null);
        return { ...prev, charts: nextCharts };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å slette klassekartet");
    }
  }

  async function handleRoomObjectsChange(next: RoomObject[]) {
    if (!detail || !chart) return;
    setChart({ ...chart, roomObjects: next });
    try {
      await fetchJson(`/api/klassekart/${detail.id}/charts/${chart.id}/room`, {
        method: "PUT",
        body: JSON.stringify({ roomObjects: next }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre rommet");
    }
  }

  async function handleImportImage(imageBase64: string, mediaType: (typeof IMAGE_MEDIA_TYPES)[number]) {
    if (!detail || !chart) return;
    const data = await fetchJson<{
      roomObjects: RoomObject[];
      podLayout: Pod[];
      pods: ChartDetail["pods"];
      students: ClassDetail["students"];
    }>(`/api/klassekart/${detail.id}/charts/${chart.id}/import-image`, {
      method: "POST",
      body: JSON.stringify({ imageBase64, mediaType }),
    });
    setChart((prev) =>
      prev ? { ...prev, roomObjects: data.roomObjects, podLayout: data.podLayout, pods: data.pods, locks: [] } : prev
    );
    setDetail((prev) => (prev ? { ...prev, students: data.students } : prev));
    setClasses((prev) => prev.map((c) => (c.id === detail.id ? { ...c, studentCount: data.students.length } : c)));
  }

  async function handlePodLayoutChange(next: Pod[], regenerate: boolean) {
    if (!detail || !chart) return;
    setChart({ ...chart, podLayout: next });
    try {
      const data = await fetchJson<{ podLayout: Pod[]; pods: ChartDetail["pods"]; locks: ChartDetail["locks"] }>(
        `/api/klassekart/${detail.id}/charts/${chart.id}/pods`,
        { method: "PUT", body: JSON.stringify({ podLayout: next, regenerate }) }
      );
      setChart((prev) => (prev ? { ...prev, podLayout: data.podLayout, pods: data.pods, locks: data.locks } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre pultoppsettet");
    }
  }

  async function handleAddStudent(name: string, gender: Gender) {
    if (!detail) return;
    try {
      const data = await fetchJson<{ student: { id: string; name: string; gender: Gender } }>(
        `/api/klassekart/${detail.id}/students`,
        { method: "POST", body: JSON.stringify({ name, gender }) }
      );
      setDetail((prev) => (prev ? { ...prev, students: [...prev.students, data.student] } : prev));
      setClasses((prev) => prev.map((c) => (c.id === detail.id ? { ...c, studentCount: c.studentCount + 1 } : c)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å legge til eleven");
    }
  }

  async function handleUpdateStudent(id: string, patch: { name?: string; gender?: Gender }) {
    if (!detail) return;
    setDetail({ ...detail, students: detail.students.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
    try {
      await fetchJson(`/api/klassekart/${detail.id}/students/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre eleven");
    }
  }

  async function handleBulkAddStudents(entries: { name: string; gender: Gender }[]) {
    if (!detail) return;
    try {
      const data = await fetchJson<{ students: { id: string; name: string; gender: Gender }[] }>(
        `/api/klassekart/${detail.id}/students/bulk`,
        { method: "POST", body: JSON.stringify({ students: entries }) }
      );
      setDetail((prev) => (prev ? { ...prev, students: [...prev.students, ...data.students] } : prev));
      setClasses((prev) =>
        prev.map((c) => (c.id === detail.id ? { ...c, studentCount: c.studentCount + data.students.length } : c))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å legge til elevene");
    }
  }

  async function handleDeleteStudent(id: string) {
    if (!detail) return;
    try {
      await fetchJson(`/api/klassekart/${detail.id}/students/${id}`, { method: "DELETE" });
      setDetail((prev) => (prev ? { ...prev, students: prev.students.filter((s) => s.id !== id) } : prev));
      setClasses((prev) =>
        prev.map((c) => (c.id === detail.id ? { ...c, studentCount: c.studentCount - 1 } : c))
      );
      // Eleven kan ha hatt plass/lås/gruppe i det kartet som vises akkurat nå
      // (serveren rydder dette på ALLE klassens kart) - speiler det lokalt.
      setChart((prev) =>
        prev
          ? {
              ...prev,
              pods: prev.pods.map((seats) => seats.map((sid) => (sid === id ? null : sid))),
              locks: prev.locks.filter((l) => l.studentId !== id),
              grupper: prev.grupper.map((g) => g.filter((sid) => sid !== id)),
            }
          : prev
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å fjerne eleven");
    }
  }

  async function handleGenerate(instruks?: string) {
    if (!detail || !chart) return {};
    try {
      const data = await fetchJson<{ pods: ChartDetail["pods"]; locks: ChartDetail["locks"]; aiFallback?: boolean }>(
        `/api/klassekart/${detail.id}/charts/${chart.id}/generate`,
        { method: "POST", body: JSON.stringify({ instruks }) }
      );
      setChart((prev) => (prev ? { ...prev, pods: data.pods, locks: data.locks, updatedAt: new Date().toISOString() } : prev));
      return { aiFallback: data.aiFallback };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å generere klassekart");
      return {};
    }
  }

  async function handleToggleLock(podIndex: number, seatIndex: number) {
    if (!detail || !chart) return;
    try {
      const data = await fetchJson<{ locks: ChartDetail["locks"] }>(
        `/api/klassekart/${detail.id}/charts/${chart.id}/lock`,
        { method: "POST", body: JSON.stringify({ podIndex, seatIndex }) }
      );
      setChart((prev) => (prev ? { ...prev, locks: data.locks } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å låse plassen");
    }
  }

  async function handleSwap(p1: number, s1: number, p2: number, s2: number, force?: boolean) {
    if (!detail || !chart) return { ok: true as const };
    const res = await fetch(`/api/klassekart/${detail.id}/charts/${chart.id}/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ p1, s1, p2, s2, force }),
    });
    const data = await res.json();
    if (res.status === 409) {
      return { ok: false as const, locked: data.locked as { id: string; name: string }[] };
    }
    if (!res.ok) {
      setError(data.error ?? "Klarte ikke å bytte plass");
      return { ok: true as const };
    }
    setChart((prev) => (prev ? { ...prev, pods: data.pods, locks: data.locks } : prev));
    return { ok: true as const };
  }

  async function handleRunGrupper(payload: {
    mode: "random" | "manuell" | "instruks";
    size?: number;
    instruks?: string;
    manualGroups?: string[][];
  }) {
    if (!detail || !chart) return { grupper: [], warnings: [] };
    const data = await fetchJson<{ grupper: string[][]; warnings: string[]; aiFallback?: boolean }>(
      `/api/klassekart/${detail.id}/charts/${chart.id}/grupper`,
      { method: "POST", body: JSON.stringify(payload) }
    );
    setChart((prev) => (prev ? { ...prev, grupper: data.grupper } : prev));
    return data;
  }

  if (loadingClasses) {
    return (
      <div className="flex justify-center py-12">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center justify-between rounded-button border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {error}
          <button type="button" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {classes.map((c) => (
          <div
            key={c.id}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
              selectedId === c.id ? "border-primary bg-primary/10 text-primary" : "border-line text-foreground/70"
            )}
          >
            {renamingId === c.id ? (
              <input
                autoFocus
                defaultValue={c.name}
                className="w-20 bg-transparent outline-none"
                onBlur={(e) => {
                  setRenamingId(null);
                  const next = e.currentTarget.value.trim();
                  if (next && next !== c.name) handleRenameClass(c.id, next);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
              />
            ) : (
              <button type="button" onClick={() => setSelectedId(c.id)} onDoubleClick={() => setRenamingId(c.id)}>
                {c.name} <span className="text-foreground/40">({c.studentCount})</span>
              </button>
            )}
            {classes.length > 1 && (
              <button
                type="button"
                aria-label={"Slett " + c.name}
                onClick={() => handleDeleteClass(c.id)}
                className="text-foreground/30 hover:text-error"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddClass}
          className="flex items-center gap-1 rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-foreground/60 hover:border-primary hover:text-primary"
        >
          <Plus size={14} /> Ny klasse
        </button>
      </div>

      {classes.length === 0 && (
        <p className="text-sm text-foreground/60">Legg til din første klasse for å komme i gang.</p>
      )}

      {selectedId && detail && (
        <>
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <span className="text-xs font-medium uppercase tracking-wide text-foreground/40">Klassekart:</span>
            {detail.charts.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
                  selectedChartId === c.id ? "border-primary bg-primary/10 text-primary" : "border-line text-foreground/70"
                )}
              >
                {renamingChartId === c.id ? (
                  <input
                    autoFocus
                    type="number"
                    min={1}
                    max={53}
                    defaultValue={c.week ?? ""}
                    placeholder="Uke"
                    className="w-12 bg-transparent outline-none"
                    onBlur={(e) => {
                      const next = e.currentTarget.value.trim();
                      handleRenameChart(c.id, { week: next ? Number(next) : null, year: new Date().getFullYear() });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedChartId(c.id)}
                    onDoubleClick={() => setRenamingChartId(c.id)}
                    title="Dobbeltklikk for å endre uke"
                  >
                    {chartLabel(c)}
                  </button>
                )}
                {detail.charts.length > 1 && (
                  <button
                    type="button"
                    aria-label={"Slett " + chartLabel(c)}
                    onClick={() => handleDeleteChart(c.id)}
                    className="text-foreground/30 hover:text-error"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
            {!newChartOpen ? (
              <button
                type="button"
                onClick={() => setNewChartOpen(true)}
                className="flex items-center gap-1 rounded-full border border-dashed border-line px-3 py-1 text-sm text-foreground/60 hover:border-primary hover:text-primary"
              >
                <Plus size={13} /> Nytt klassekart
              </button>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddChart();
                }}
                className="flex items-center gap-1.5 rounded-full border border-line px-2 py-1"
              >
                <label className="flex items-center gap-1 text-xs text-foreground/60">
                  Uke
                  <input
                    autoFocus
                    type="number"
                    min={1}
                    max={53}
                    value={newChartWeek}
                    onChange={(e) => setNewChartWeek(e.target.value)}
                    className="w-12 rounded border border-line bg-background px-1 py-0.5 text-sm"
                  />
                </label>
                <label className="flex items-center gap-1 text-xs text-foreground/60">
                  År
                  <input
                    type="number"
                    value={newChartYear}
                    onChange={(e) => setNewChartYear(e.target.value)}
                    className="w-16 rounded border border-line bg-background px-1 py-0.5 text-sm"
                  />
                </label>
                <button type="submit" className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                  Lag
                </button>
                <button
                  type="button"
                  onClick={() => setNewChartOpen(false)}
                  className="text-xs text-foreground/50"
                >
                  Avbryt
                </button>
              </form>
            )}
          </div>

          <div className="flex gap-1 border-b border-line">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "px-3 py-2 text-sm font-medium",
                  tab === t.key ? "border-b-2 border-primary text-primary" : "text-foreground/60"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loadingDetail || loadingChart || !chart ? (
            <div className="flex justify-center py-12">
              <LoadingDots />
            </div>
          ) : (
            <>
              {tab === "rom" && (
                <RoomEditor
                  roomObjects={chart.roomObjects}
                  hasExistingData={chart.roomObjects.length > 0 || detail.students.length > 0}
                  onChange={handleRoomObjectsChange}
                  onImportImage={handleImportImage}
                />
              )}
              {tab === "pulter" && (
                <PodEditor
                  roomObjects={chart.roomObjects}
                  podLayout={chart.podLayout}
                  students={detail.students}
                  onPodLayoutChange={handlePodLayoutChange}
                />
              )}
              {tab === "elever" && (
                <RosterEditor
                  students={detail.students}
                  onAdd={handleAddStudent}
                  onUpdate={handleUpdateStudent}
                  onDelete={handleDeleteStudent}
                  onBulkAdd={handleBulkAddStudents}
                />
              )}
              {tab === "kart" && (
                <SeatingView
                  roomObjects={chart.roomObjects}
                  podLayout={chart.podLayout}
                  pods={chart.pods}
                  locks={chart.locks}
                  students={detail.students}
                  updatedAt={chart.updatedAt}
                  onGenerate={handleGenerate}
                  onToggleLock={handleToggleLock}
                  onSwap={handleSwap}
                  onOpenPresent={() => setPresentOpen(true)}
                  onOpenShare={() => setShareOpen(true)}
                />
              )}
              {tab === "grupper" && (
                <GrupperEditor
                  className={detail.name}
                  students={detail.students}
                  grupper={chart.grupper}
                  onRun={handleRunGrupper}
                />
              )}
            </>
          )}

          {chart && (
            <>
              <PresentationOverlay
                open={presentOpen}
                onClose={() => setPresentOpen(false)}
                className={detail.name}
                roomObjects={chart.roomObjects}
                podLayout={chart.podLayout}
                pods={chart.pods}
                students={detail.students}
              />
              <ShareOverlay
                open={shareOpen}
                onClose={() => setShareOpen(false)}
                roomObjects={chart.roomObjects}
                podLayout={chart.podLayout}
                pods={chart.pods}
                students={detail.students}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
