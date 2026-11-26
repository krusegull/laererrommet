"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Inbox } from "lucide-react";

interface ClassSummaryLite {
  id: string;
  name: string;
}

interface ClassStudentLite {
  id: string;
  name: string;
}

interface ImportElev {
  navn: string;
  id: string;
  egne: number;
  ekstra: number;
  atferd: number;
}

interface ImportLag {
  navn: string;
  poeng: number;
  elever: ImportElev[];
}

interface ImportPayload {
  tittel: string;
  fag: string;
  tema: string;
  classId: string;
  dato: string;
  lag: ImportLag[];
}

type Mode = "plassering" | "lagegne" | "barelag" | "bareegne";

function parsePayload(raw: string): ImportPayload | null {
  try {
    const d: unknown = JSON.parse(raw);
    if (!d || typeof d !== "object") return null;
    const obj = d as Record<string, unknown>;
    if (!Array.isArray(obj.lag)) return null;
    const lag: ImportLag[] = obj.lag.map((l) => {
      const lo = (l ?? {}) as Record<string, unknown>;
      const elever: ImportElev[] = Array.isArray(lo.elever)
        ? lo.elever
            .map((e) => {
              const eo = (e ?? {}) as Record<string, unknown>;
              return {
                navn: String(eo.navn ?? "").trim(),
                id: String(eo.id ?? ""),
                egne: Number(eo.egne) || 0,
                ekstra: Number(eo.ekstra) || 0,
                atferd: Number(eo.atferd) || 0,
              };
            })
            .filter((e: ImportElev) => e.navn)
        : [];
      return { navn: String(lo.navn ?? "Lag"), poeng: Number(lo.poeng) || 0, elever };
    });
    return {
      tittel: String(obj.tittel ?? "Konkurranse"),
      fag: String(obj.fag ?? ""),
      tema: String(obj.tema ?? ""),
      classId: String(obj.classId ?? ""),
      dato: String(obj.dato ?? new Date().toISOString().slice(0, 10)),
      lag,
    };
  } catch {
    return null;
  }
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

function placementPoints(rank: number): number {
  if (rank === 1) return 10;
  if (rank === 2) return 7;
  if (rank === 3) return 5;
  return 3;
}

export function PoengImporterClient() {
  const [payload, setPayload] = useState<ImportPayload | null>(null);
  const [parseFailed, setParseFailed] = useState(false);

  const [classes, setClasses] = useState<ClassSummaryLite[]>([]);
  const [classId, setClassId] = useState("");
  const [roster, setRoster] = useState<ClassStudentLite[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [fag, setFag] = useState("");
  const [kilde, setKilde] = useState("");
  const [dato, setDato] = useState("");
  const [mode, setMode] = useState<Mode>("plassering");
  const [scale, setScale] = useState(1);

  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [assignmentsInitialized, setAssignmentsInitialized] = useState(false);
  const [faglig, setFaglig] = useState<Record<string, string>>({});
  const [atferd, setAtferd] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hashHandled = useRef(false);
  useEffect(() => {
    // Leser (og fjerner) location.hash - idempotent-vakt nødvendig fordi
    // History/location ikke er React-state: uten denne ville Reacts
    // dobbeltkjøring av effekter i dev-modus lese hashen på nytt etter at
    // første kjøring allerede har fjernet den, og feilaktig sette parseFailed.
    if (hashHandled.current) return;
    hashHandled.current = true;

    const h = window.location.hash.replace(/^#/, "");
    const m = h.match(/(?:^|&)d=([^&]*)/);
    if (!m) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leser location.hash én gang ved mount
      setParseFailed(true);
      return;
    }
    let raw = "";
    try {
      raw = decodeURIComponent(m[1]);
    } catch {
      setParseFailed(true);
      return;
    }
    const parsed = parsePayload(raw);
    if (!parsed) {
      setParseFailed(true);
      return;
    }
    setPayload(parsed);
    setFag(parsed.fag);
    setKilde(parsed.tittel);
    setDato(parsed.dato);
    try {
      history.replaceState(null, "", window.location.pathname);
    } catch {
      // ignorer - rent kosmetisk
    }
  }, []);

  useEffect(() => {
    fetchJson<{ classes: ClassSummaryLite[] }>("/api/klassekart")
      .then((data) => setClasses(data.classes))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingClasses(false));
  }, []);

  useEffect(() => {
    if (!payload?.classId) return;
    fetchJson<{ class: { students: ClassStudentLite[] } }>(`/api/klassekart/${payload.classId}`)
      .then((data) => {
        setClassId(payload.classId);
        setRoster(data.class.students);
      })
      .catch(() => {
        // classId fra spillet tilhører ikke denne læreren (eller er ugyldig) -
        // læreren må velge klasse manuelt under.
      });
  }, [payload]);

  useEffect(() => {
    if (!classId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet nullstilling når ingen klasse er valgt
      setRoster([]);
      return;
    }
    fetchJson<{ class: { students: ClassStudentLite[] } }>(`/api/klassekart/${classId}`)
      .then((data) => setRoster(data.class.students))
      .catch((e) => setError(e.message));
  }, [classId]);

  const students = useMemo(() => {
    if (!payload) return [];
    const ranked = payload.lag
      .map((l, idx) => ({ idx, poeng: l.poeng }))
      .sort((a, b) => b.poeng - a.poeng);
    const rankOf = new Map<number, number>();
    ranked.forEach((l, i) => rankOf.set(l.idx, i + 1));

    return payload.lag.flatMap((lag, lagIdx) =>
      lag.elever.map((e, elevIdx) => ({
        key: lagIdx + "-" + elevIdx,
        navn: e.navn,
        lagNavn: lag.navn,
        lagPoeng: lag.poeng,
        rank: rankOf.get(lagIdx) ?? lagIdx + 1,
        egne: e.egne,
        ekstra: e.ekstra,
        atferd: e.atferd,
        importId: e.id,
      }))
    );
  }, [payload]);

  const nameIndex = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of roster) map.set(s.name.trim().toLowerCase(), s.id);
    return map;
  }, [roster]);
  const idSet = useMemo(() => new Set(roster.map((s) => s.id)), [roster]);

  useEffect(() => {
    if (assignmentsInitialized || roster.length === 0 || students.length === 0) return;
    const next: Record<string, string> = {};
    for (const s of students) {
      if (s.importId && idSet.has(s.importId)) next[s.key] = s.importId;
      else {
        const byName = nameIndex.get(s.navn.toLowerCase());
        next[s.key] = byName ?? "";
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initialiserer auto-matching én gang når roster+elever er klare
    setAssignments(next);
    setAssignmentsInitialized(true);
  }, [students, roster, nameIndex, idSet, assignmentsInitialized]);

  function suggestFaglig(s: (typeof students)[number]): number {
    if (mode === "plassering") return placementPoints(s.rank) + s.ekstra * 2;
    if (mode === "lagegne") return Math.round((s.lagPoeng + s.egne) / scale);
    if (mode === "barelag") return Math.round(s.lagPoeng / scale);
    return Math.round(s.egne / scale);
  }

  function fillForslag() {
    const nextFaglig: Record<string, string> = {};
    const nextAtferd: Record<string, string> = {};
    for (const s of students) {
      nextFaglig[s.key] = String(suggestFaglig(s));
      nextAtferd[s.key] = String(s.atferd);
    }
    setFaglig(nextFaglig);
    setAtferd(nextAtferd);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fyller forslaget automatisk første gang elevene er klare
    if (students.length > 0 && Object.keys(faglig).length === 0) fillForslag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students]);

  async function handleSave() {
    if (!classId || !payload) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const writes: Promise<unknown>[] = [];
      let count = 0;
      for (const s of students) {
        const classStudentId = assignments[s.key];
        if (!classStudentId) continue;
        const fagligVerdi = Number(faglig[s.key]) || 0;
        const atferdVerdi = Number(atferd[s.key]) || 0;
        if (fagligVerdi !== 0) {
          writes.push(
            fetchJson("/api/poeng", {
              method: "POST",
              body: JSON.stringify({ classId, classStudentId, fag: fag.trim() || "annet", poeng: fagligVerdi, kilde: kilde.trim() || undefined, dato }),
            })
          );
        }
        if (atferdVerdi !== 0) {
          writes.push(
            fetchJson("/api/poeng", {
              method: "POST",
              body: JSON.stringify({ classId, classStudentId, fag: "atferd", poeng: atferdVerdi, kilde: kilde.trim() || undefined, dato }),
            })
          );
        }
        count += 1;
      }
      await Promise.all(writes);
      setMessage(`Lagret poeng for ${count} elever.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre poengene");
    } finally {
      setSaving(false);
    }
  }

  if (parseFailed) {
    return (
      <EmptyState
        icon={<Inbox size={32} />}
        title="Fant ingen poeng å importere"
        description="Denne siden skal åpnes fra «Send til Lærerrommet» i konkurransen. Prøv igjen derfra."
      />
    );
  }

  if (!payload) {
    return <p className="text-sm text-foreground/60">Laster...</p>;
  }

  const unmatchedCount = students.filter((s) => !assignments[s.key]).length;

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-error">{error}</p>}
      {message && <p className="text-sm text-success">{message}</p>}

      <Card>
        <div className="flex flex-col gap-3">
          <p className="font-medium text-foreground">
            {payload.tittel}
            {payload.tema ? " – " + payload.tema : ""}
          </p>

          {!loadingClasses && !classId && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-foreground">
                Fant ikke klassen automatisk - velg hvilken klasse dette gjelder
              </span>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Velg klasse</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="Fag" value={fag} onChange={(e) => setFag(e.target.value)} />
            <Input label="Kilde" value={kilde} onChange={(e) => setKilde(e.target.value)} />
            <Input label="Dato" type="date" value={dato} onChange={(e) => setDato(e.target.value)} />
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-foreground">Forslagsmodell</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="plassering">Anbefalt (plassering: 10/7/5/3 + 2 per ⭐)</option>
                <option value="lagegne">Lag + egne poeng (skalert)</option>
                <option value="barelag">Bare lagpoeng (skalert)</option>
                <option value="bareegne">Bare egne poeng (skalert)</option>
              </select>
            </label>
            {mode !== "plassering" && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-foreground">Skalering</span>
                <select
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value={1}>÷1</option>
                  <option value={10}>÷10</option>
                  <option value={100}>÷100</option>
                </select>
              </label>
            )}
            <Button type="button" variant="secondary" size="sm" onClick={fillForslag}>
              Fyll forslag på nytt
            </Button>
          </div>

          {unmatchedCount > 0 && (
            <p className="text-sm text-error">
              {unmatchedCount} elev{unmatchedCount === 1 ? "" : "er"} er ikke koblet til en elev i klassen ennå
              - velg manuelt under, eller la stå tomt for å hoppe over.
            </p>
          )}
        </div>
      </Card>

      {classId && roster.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-medium text-foreground/50">
                  <th className="py-2 pr-2">Fra spillet</th>
                  <th className="py-2 pr-2">Lag</th>
                  <th className="py-2 pr-2">Koblet elev</th>
                  <th className="py-2 pr-2">Lagpoeng</th>
                  <th className="py-2 pr-2">Egne</th>
                  <th className="py-2 pr-2">⭐</th>
                  <th className="py-2 pr-2">Faglig poeng</th>
                  <th className="py-2 pr-2">Atferd</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.key} className="border-b border-line/50">
                    <td className="py-2 pr-2 font-medium text-foreground">{s.navn}</td>
                    <td className="py-2 pr-2 text-foreground/60">{s.lagNavn}</td>
                    <td className="py-2 pr-2">
                      <select
                        value={assignments[s.key] ?? ""}
                        onChange={(e) => setAssignments((prev) => ({ ...prev, [s.key]: e.target.value }))}
                        className="rounded-button border border-line bg-background px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Hopp over</option>
                        {roster.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2 text-foreground/60">{s.lagPoeng}</td>
                    <td className="py-2 pr-2 text-foreground/60">{s.egne}</td>
                    <td className="py-2 pr-2 text-foreground/60">{s.ekstra}</td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={faglig[s.key] ?? "0"}
                        onChange={(e) => setFaglig((prev) => ({ ...prev, [s.key]: e.target.value }))}
                        className="w-20 rounded-button border border-line bg-background px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={atferd[s.key] ?? "0"}
                        onChange={(e) => setAtferd((prev) => ({ ...prev, [s.key]: e.target.value }))}
                        className="w-20 rounded-button border border-line bg-background px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Button type="button" onClick={handleSave} loading={saving} disabled={!classId}>
              Lagre poeng for alle elevene
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
