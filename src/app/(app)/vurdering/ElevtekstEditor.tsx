"use client";

import { useEffect, useState } from "react";
import { Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { cn } from "@/lib/cn";
import { resolveKarakter } from "@/lib/vurdering/karakter";
import type { KriterieVurdering } from "@/lib/vurdering/types";
import type { MalSummary, ElevTekstDetail, ElevTekstSummary } from "./types";

interface ClassSummaryLite {
  id: string;
  name: string;
}

interface ClassStudentLite {
  id: string;
  name: string;
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

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function ElevtekstEditor() {
  const [tekster, setTekster] = useState<ElevTekstSummary[]>([]);
  const [loadingTekster, setLoadingTekster] = useState(true);
  const [classes, setClasses] = useState<ClassSummaryLite[]>([]);
  const [maler, setMaler] = useState<MalSummary[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [formClassId, setFormClassId] = useState("");
  const [classRoster, setClassRoster] = useState<ClassStudentLite[]>([]);
  const [formClassStudentId, setFormClassStudentId] = useState("");
  const [formMalId, setFormMalId] = useState("");
  const [formTittel, setFormTittel] = useState("");
  const [formTekst, setFormTekst] = useState("");
  const [formDato, setFormDato] = useState(todayIso());
  const [creating, setCreating] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ElevTekstDetail | null>(null);
  const [loadingSelected, setLoadingSelected] = useState(false);
  const [scoreDraft, setScoreDraft] = useState<string>("");
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [kriterieVurderingDraft, setKriterieVurderingDraft] = useState<KriterieVurdering[] | null>(null);
  const [savingVurdering, setSavingVurdering] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchJson<{ tekster: ElevTekstSummary[] }>("/api/vurdering/elevtekster"),
      fetchJson<{ classes: ClassSummaryLite[] }>("/api/klassekart"),
      fetchJson<{ maler: MalSummary[] }>("/api/vurdering/maler"),
    ])
      .then(([tekstData, classData, malData]) => {
        setTekster(tekstData.tekster);
        setClasses(classData.classes);
        setMaler(malData.maler);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingTekster(false));
  }, []);

  useEffect(() => {
    if (!formClassId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet nullstilling når det ikke finnes en valgt klasse
      setClassRoster([]);
      return;
    }
    fetchJson<{ class: { students: ClassStudentLite[] } }>(`/api/klassekart/${formClassId}`)
      .then((data) => setClassRoster(data.class.students))
      .catch((e) => setError(e.message));
  }, [formClassId]);

  useEffect(() => {
    if (!selectedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet nullstilling når det ikke finnes en valgt elevtekst
      setSelected(null);
      return;
    }
    setLoadingSelected(true);
    fetchJson<{ tekst: ElevTekstDetail }>(`/api/vurdering/elevtekster/${selectedId}`)
      .then((data) => {
        setSelected(data.tekst);
        setScoreDraft(data.tekst.score != null ? String(data.tekst.score) : "");
        setFeedbackDraft(data.tekst.tilbakemelding ?? "");
        setKriterieVurderingDraft(data.tekst.kriterieVurdering);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSelected(false));
  }, [selectedId]);

  async function handleCreate() {
    if (!formClassId || !formClassStudentId || !formMalId || !formTittel.trim() || !formTekst.trim()) return;
    setCreating(true);
    try {
      const data = await fetchJson<{ tekst: ElevTekstDetail }>("/api/vurdering/elevtekster", {
        method: "POST",
        body: JSON.stringify({
          classId: formClassId,
          classStudentId: formClassStudentId,
          malId: formMalId,
          tittel: formTittel.trim(),
          tekst: formTekst,
          dato: formDato,
        }),
      });
      setTekster((prev) => [
        {
          id: data.tekst.id,
          studentId: data.tekst.studentId,
          studentName: data.tekst.studentName,
          malId: data.tekst.malId,
          malName: data.tekst.malName,
          tittel: data.tekst.tittel,
          score: data.tekst.score,
          karakter: data.tekst.karakter,
          dato: data.tekst.dato,
          updatedAt: data.tekst.updatedAt,
        },
        ...prev,
      ]);
      setFormOpen(false);
      setFormClassId("");
      setFormClassStudentId("");
      setFormMalId("");
      setFormTittel("");
      setFormTekst("");
      setFormDato(todayIso());
      setSelectedId(data.tekst.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre elevteksten");
    } finally {
      setCreating(false);
    }
  }

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("text/") && !file.name.endsWith(".txt")) {
      setError("Bare vanlige tekstfiler (.txt) kan lastes opp ennå - lim inn teksten for andre filtyper.");
      return;
    }
    const content = await file.text();
    setFormTekst(content);
    if (!formTittel.trim()) setFormTittel(file.name.replace(/\.txt$/i, ""));
  }

  async function saveVurdering() {
    if (!selected) return;
    setSavingVurdering(true);
    try {
      const score = scoreDraft.trim() === "" ? null : Number(scoreDraft);
      const data = await fetchJson<{ tekst: ElevTekstDetail }>(`/api/vurdering/elevtekster/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ score, tilbakemelding: feedbackDraft, kriterieVurdering: kriterieVurderingDraft }),
      });
      setSelected(data.tekst);
      setKriterieVurderingDraft(data.tekst.kriterieVurdering);
      setTekster((prev) =>
        prev.map((t) => (t.id === data.tekst.id ? { ...t, score: data.tekst.score, karakter: data.tekst.karakter } : t))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre vurderingen");
    } finally {
      setSavingVurdering(false);
    }
  }

  async function requestAiForslag() {
    if (!selected) return;
    setAiLoading(true);
    try {
      const data = await fetchJson<{ score: number; tilbakemelding: string; kriterieVurdering: KriterieVurdering[] }>(
        `/api/vurdering/elevtekster/${selected.id}/ai-forslag`,
        { method: "POST" }
      );
      setScoreDraft(String(data.score));
      setFeedbackDraft(data.tilbakemelding);
      setKriterieVurderingDraft(data.kriterieVurdering);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å hente KI-forslag");
    } finally {
      setAiLoading(false);
    }
  }

  function handleManualScoreChange(value: string) {
    setScoreDraft(value);
    // Et manuelt tastet poeng gjør ikke lenger KI-regnestykket gyldig - det
    // ville vist en nedbryting som ikke lenger summerer til tallet som vises.
    setKriterieVurderingDraft(null);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Slette denne elevteksten og vurderingen av den?")) return;
    try {
      await fetchJson(`/api/vurdering/elevtekster/${id}`, { method: "DELETE" });
      setTekster((prev) => prev.filter((t) => t.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å slette elevteksten");
    }
  }

  const livePreviewKarakter = selected
    ? resolveKarakter(scoreDraft.trim() === "" ? null : Number(scoreDraft), selected.skala)
    : null;

  if (loadingTekster) {
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

      {maler.length === 0 ? (
        <EmptyState
          title="Ingen vurderingsmaler ennå"
          description="Lag en vurderingsmal under «Maler»-fanen først, så kan du laste opp elevtekster og vurdere dem mot den."
        />
      ) : classes.length === 0 ? (
        <EmptyState
          title="Ingen klasser ennå"
          description="Legg til en klasse med elevliste under Klassekart først, så kan du matche elevtekster til riktig elev."
        />
      ) : (
        <>
          <div className="flex justify-end">
            <Button type="button" size="sm" onClick={() => setFormOpen((v) => !v)}>
              <Plus size={14} /> {formOpen ? "Avbryt" : "Ny elevtekst"}
            </Button>
          </div>

          {formOpen && (
            <Card>
              <div className="flex flex-col gap-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-foreground">Klasse</span>
                    <select
                      value={formClassId}
                      onChange={(e) => {
                        setFormClassId(e.target.value);
                        setFormClassStudentId("");
                      }}
                      className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Velg klasse...</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-foreground">Elev</span>
                    <select
                      value={formClassStudentId}
                      onChange={(e) => setFormClassStudentId(e.target.value)}
                      disabled={!formClassId}
                      className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    >
                      <option value="">Velg elev...</option>
                      {classRoster.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-foreground">Vurderingsmal</span>
                    <select
                      value={formMalId}
                      onChange={(e) => setFormMalId(e.target.value)}
                      className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Velg mal...</option>
                      {maler.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                  <Input
                    label="Tittel"
                    placeholder="F.eks. «Novelle - høstinnlevering»"
                    value={formTittel}
                    onChange={(e) => setFormTittel(e.target.value)}
                  />
                  <Input
                    label="Dato"
                    type="date"
                    value={formDato}
                    onChange={(e) => setFormDato(e.target.value)}
                  />
                </div>

                <label className="flex flex-col gap-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Tekst</span>
                    <label className="flex cursor-pointer items-center gap-1 text-xs text-primary hover:underline">
                      <Upload size={13} /> Last opp .txt-fil
                      <input
                        type="file"
                        accept=".txt,text/plain"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <textarea
                    placeholder="Lim inn elevteksten her..."
                    value={formTekst}
                    onChange={(e) => setFormTekst(e.target.value)}
                    rows={8}
                    className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <Button
                  type="button"
                  onClick={handleCreate}
                  loading={creating}
                  disabled={!formClassId || !formClassStudentId || !formMalId || !formTittel.trim() || !formTekst.trim()}
                  className="self-start"
                >
                  Lagre elevtekst
                </Button>
                <p className="text-xs text-foreground/50">
                  Du kan vurdere teksten (poengsum og tilbakemelding) nå eller senere.
                </p>
              </div>
            </Card>
          )}

          {tekster.length === 0 ? (
            <EmptyState
              title="Ingen elevtekster lastet opp ennå"
              description="Last opp den første elevteksten for å komme i gang."
            />
          ) : (
            <Card>
              <div className="flex flex-col divide-y divide-line">
                {tekster.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className={cn(
                      "flex items-center justify-between gap-3 py-2.5 text-left text-sm first:pt-0 last:pb-0",
                      selectedId === t.id && "text-primary"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{t.tittel}</span>
                      <span className="text-foreground/50">
                        {t.studentName} · {t.malName} · {new Date(t.dato).toLocaleDateString("nb-NO")}
                      </span>
                    </div>
                    {t.karakter ? (
                      <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                        {t.karakter} ({t.score} p)
                      </span>
                    ) : (
                      <span className="rounded-full bg-background-subtle px-2.5 py-1 text-xs text-foreground/50">
                        Ikke vurdert
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {selectedId &&
            (loadingSelected || !selected ? (
              <div className="flex justify-center py-8">
                <LoadingDots />
              </div>
            ) : (
              <Card
                header={
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-foreground">{selected.tittel}</h2>
                      <p className="text-sm text-foreground/50">
                        {selected.studentName} · {selected.malName} ·{" "}
                        {new Date(selected.dato).toLocaleDateString("nb-NO")}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={"Slett " + selected.tittel}
                      onClick={() => handleDelete(selected.id)}
                      className="text-foreground/30 hover:text-error"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                }
              >
                <div className="flex flex-col gap-4">
                  <details>
                    <summary className="cursor-pointer text-sm font-medium text-foreground">Vis teksten</summary>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">{selected.tekst}</p>
                  </details>

                  <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground" htmlFor="score-input">
                        Poengsum (0-100)
                      </label>
                      <input
                        id="score-input"
                        type="number"
                        min={0}
                        max={100}
                        value={scoreDraft}
                        onChange={(e) => handleManualScoreChange(e.target.value)}
                        className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {livePreviewKarakter && (
                        <span className="text-sm font-medium text-success">→ Karakter {livePreviewKarakter}</span>
                      )}
                      {selected.skala.length === 0 && (
                        <span className="text-xs text-foreground/40">
                          Malen har ingen karakterskala ennå - kun poengsum lagres.
                        </span>
                      )}
                    </div>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-foreground">Samlet tilbakemelding</span>
                      <textarea
                        value={feedbackDraft}
                        onChange={(e) => setFeedbackDraft(e.target.value)}
                        rows={4}
                        placeholder="Skriv en samlet tilbakemelding eleven kan forstå og bruke videre..."
                        className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                  </div>

                  {kriterieVurderingDraft && kriterieVurderingDraft.length > 0 && (
                    <div className="flex flex-col gap-2 rounded-button border border-line p-3">
                      <p className="text-sm font-medium text-foreground">Regnestykke fra KI-forslaget</p>
                      {kriterieVurderingDraft.map((k) => (
                        <div key={k.kriteriumId} className="flex flex-col gap-0.5 border-b border-line pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">
                              {k.kriteriumName} ({k.weight}%)
                            </span>
                            <span className="text-foreground/60">
                              {k.poengandel} p → bidrag {Math.round((k.weight / 100) * k.poengandel)} p
                            </span>
                          </div>
                          {k.ekstraBraOppfylt !== null && (
                            <span className={cn("text-xs", k.ekstraBraOppfylt ? "text-success" : "text-foreground/40")}>
                              {k.ekstraBraOppfylt ? "✓ Ekstra bra-kriteriene oppfylt" : "Ekstra bra-kriteriene ikke oppfylt"}
                            </span>
                          )}
                          {k.kommentar && <p className="text-sm text-foreground/70">{k.kommentar}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={requestAiForslag}
                      loading={aiLoading}
                    >
                      <Sparkles size={14} /> Foreslå med KI
                    </Button>
                    <Button type="button" size="sm" onClick={saveVurdering} loading={savingVurdering}>
                      Lagre vurdering
                    </Button>
                  </div>
                  <p className="text-xs text-foreground/50">
                    KI-forslaget fyller ut poengsum og tilbakemelding under - se gjennom og rediger før du
                    lagrer. Elevteksten sendes til Claude (Anthropic) sin API for å lage forslaget.
                  </p>
                </div>
              </Card>
            ))}
        </>
      )}
    </div>
  );
}
