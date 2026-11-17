"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { cn } from "@/lib/cn";
import type { Gender, Pod, RoomObject } from "@/lib/klassekart/types";
import type { IMAGE_MEDIA_TYPES } from "@/lib/validations";
import type { ClassDetail, ClassSummary, TabKey } from "./types";
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
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [tab, setTab] = useState<TabKey>("rom");
  const [renamingId, setRenamingId] = useState<string | null>(null);
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
      .then((data) => setDetail(data.class))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

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
    if (!window.confirm("Slette denne klassen? Dette fjerner også elevlisten og klassekartet.")) return;
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

  async function handleRoomObjectsChange(next: RoomObject[]) {
    if (!detail) return;
    setDetail({ ...detail, roomObjects: next });
    try {
      await fetchJson(`/api/klassekart/${detail.id}/room`, {
        method: "PUT",
        body: JSON.stringify({ roomObjects: next }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre rommet");
    }
  }

  async function handleImportImage(imageBase64: string, mediaType: (typeof IMAGE_MEDIA_TYPES)[number]) {
    if (!detail) return;
    const data = await fetchJson<{
      roomObjects: RoomObject[];
      podLayout: Pod[];
      pods: ClassDetail["pods"];
      students: ClassDetail["students"];
    }>(`/api/klassekart/${detail.id}/import-image`, {
      method: "POST",
      body: JSON.stringify({ imageBase64, mediaType }),
    });
    setDetail((prev) =>
      prev
        ? { ...prev, roomObjects: data.roomObjects, podLayout: data.podLayout, pods: data.pods, students: data.students, locks: [] }
        : prev
    );
    setClasses((prev) => prev.map((c) => (c.id === detail.id ? { ...c, studentCount: data.students.length } : c)));
  }

  async function handlePodLayoutChange(next: Pod[], regenerate: boolean) {
    if (!detail) return;
    setDetail({ ...detail, podLayout: next });
    try {
      const data = await fetchJson<{ podLayout: Pod[]; pods: ClassDetail["pods"]; locks: ClassDetail["locks"] }>(
        `/api/klassekart/${detail.id}/pods`,
        { method: "PUT", body: JSON.stringify({ podLayout: next, regenerate }) }
      );
      setDetail((prev) => (prev ? { ...prev, podLayout: data.podLayout, pods: data.pods, locks: data.locks } : prev));
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å fjerne eleven");
    }
  }

  async function handleGenerate(instruks?: string) {
    if (!detail) return {};
    try {
      const data = await fetchJson<{ pods: ClassDetail["pods"]; locks: ClassDetail["locks"]; aiFallback?: boolean }>(
        `/api/klassekart/${detail.id}/generate`,
        { method: "POST", body: JSON.stringify({ instruks }) }
      );
      setDetail((prev) => (prev ? { ...prev, pods: data.pods, locks: data.locks, updatedAt: new Date().toISOString() } : prev));
      return { aiFallback: data.aiFallback };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å generere klassekart");
      return {};
    }
  }

  async function handleToggleLock(podIndex: number, seatIndex: number) {
    if (!detail) return;
    try {
      const data = await fetchJson<{ locks: ClassDetail["locks"] }>(`/api/klassekart/${detail.id}/lock`, {
        method: "POST",
        body: JSON.stringify({ podIndex, seatIndex }),
      });
      setDetail((prev) => (prev ? { ...prev, locks: data.locks } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å låse plassen");
    }
  }

  async function handleSwap(p1: number, s1: number, p2: number, s2: number, force?: boolean) {
    if (!detail) return { ok: true as const };
    const res = await fetch(`/api/klassekart/${detail.id}/swap`, {
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
    setDetail((prev) => (prev ? { ...prev, pods: data.pods, locks: data.locks } : prev));
    return { ok: true as const };
  }

  async function handleRunGrupper(payload: {
    mode: "random" | "manuell" | "instruks";
    size?: number;
    instruks?: string;
    manualGroups?: string[][];
  }) {
    if (!detail) return { grupper: [], warnings: [] };
    const data = await fetchJson<{ grupper: string[][]; warnings: string[]; aiFallback?: boolean }>(
      `/api/klassekart/${detail.id}/grupper`,
      { method: "POST", body: JSON.stringify(payload) }
    );
    setDetail((prev) => (prev ? { ...prev, grupper: data.grupper } : prev));
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

          {loadingDetail ? (
            <div className="flex justify-center py-12">
              <LoadingDots />
            </div>
          ) : (
            <>
              {tab === "rom" && (
                <RoomEditor
                  roomObjects={detail.roomObjects}
                  hasExistingData={detail.roomObjects.length > 0 || detail.students.length > 0}
                  onChange={handleRoomObjectsChange}
                  onImportImage={handleImportImage}
                />
              )}
              {tab === "pulter" && (
                <PodEditor
                  roomObjects={detail.roomObjects}
                  podLayout={detail.podLayout}
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
                  roomObjects={detail.roomObjects}
                  podLayout={detail.podLayout}
                  pods={detail.pods}
                  locks={detail.locks}
                  students={detail.students}
                  updatedAt={detail.updatedAt}
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
                  grupper={detail.grupper}
                  onRun={handleRunGrupper}
                />
              )}
            </>
          )}

          <PresentationOverlay
            open={presentOpen}
            onClose={() => setPresentOpen(false)}
            className={detail.name}
            roomObjects={detail.roomObjects}
            podLayout={detail.podLayout}
            pods={detail.pods}
            students={detail.students}
          />
          <ShareOverlay
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            roomObjects={detail.roomObjects}
            podLayout={detail.podLayout}
            pods={detail.pods}
            students={detail.students}
          />
        </>
      )}
    </div>
  );
}
