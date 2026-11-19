"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { cn } from "@/lib/cn";
import type { Kriterium, SkalaEntry } from "@/lib/vurdering/types";
import type { MalDetail, MalSummary } from "./types";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Noe gikk feil");
  return data;
}

function newKriterium(): Kriterium {
  return { id: crypto.randomUUID(), name: "", description: "", weight: 0, ekstraBra: "" };
}

export function VurderingClient() {
  const [maler, setMaler] = useState<MalSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mal, setMal] = useState<MalDetail | null>(null);
  const [loadingMaler, setLoadingMaler] = useState(true);
  const [loadingMal, setLoadingMal] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [kriterierDraft, setKriterierDraft] = useState<Kriterium[]>([]);
  const [skalaDraft, setSkalaDraft] = useState<SkalaEntry[]>([]);
  const [savingKriterier, setSavingKriterier] = useState(false);
  const [savingSkala, setSavingSkala] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<{ maler: MalSummary[] }>("/api/vurdering/maler")
      .then((data) => {
        setMaler(data.maler);
        if (data.maler.length > 0) setSelectedId(data.maler[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingMaler(false));
  }, []);

  useEffect(() => {
    if (!selectedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet nullstilling når det ikke finnes en valgt mal
      setMal(null);
      return;
    }
    setLoadingMal(true);
    fetchJson<{ mal: MalDetail }>(`/api/vurdering/maler/${selectedId}`)
      .then((data) => {
        setMal(data.mal);
        setKriterierDraft(data.mal.kriterier.length > 0 ? data.mal.kriterier : []);
        setSkalaDraft(data.mal.skala);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingMal(false));
  }, [selectedId]);

  async function handleAddMal() {
    try {
      const data = await fetchJson<{ mal: MalSummary }>("/api/vurdering/maler", {
        method: "POST",
        body: JSON.stringify({ name: "Ny mal" }),
      });
      setMaler((prev) => [...prev, data.mal]);
      setSelectedId(data.mal.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lage malen");
    }
  }

  async function handleRenameMal(id: string, name: string) {
    setMaler((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));
    if (mal?.id === id) setMal((prev) => (prev ? { ...prev, name } : prev));
    try {
      await fetchJson(`/api/vurdering/maler/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre navnet");
    }
  }

  async function handleDeleteMal(id: string) {
    if (!window.confirm("Slette denne vurderingsmalen? Dette fjerner alle kriteriene og skalaen.")) return;
    try {
      await fetchJson(`/api/vurdering/maler/${id}`, { method: "DELETE" });
      setMaler((prev) => {
        const next = prev.filter((m) => m.id !== id);
        if (selectedId === id) setSelectedId(next[0]?.id ?? null);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å slette malen");
    }
  }

  function addKriterium() {
    setKriterierDraft((prev) => [...prev, newKriterium()]);
  }

  function updateKriterium(id: string, patch: Partial<Kriterium>) {
    setKriterierDraft((prev) => prev.map((k) => (k.id === id ? { ...k, ...patch } : k)));
  }

  function removeKriterium(id: string) {
    setKriterierDraft((prev) => prev.filter((k) => k.id !== id));
  }

  const weightSum = kriterierDraft.reduce((sum, k) => sum + (k.weight || 0), 0);
  const weightOk = kriterierDraft.length === 0 || weightSum === 100;
  const kriterierNamesOk = kriterierDraft.every((k) => k.name.trim().length > 0);

  async function saveKriterier() {
    if (!mal) return;
    setSavingKriterier(true);
    try {
      const data = await fetchJson<{ kriterier: Kriterium[] }>(`/api/vurdering/maler/${mal.id}/kriterier`, {
        method: "PUT",
        body: JSON.stringify({ kriterier: kriterierDraft }),
      });
      setMal((prev) => (prev ? { ...prev, kriterier: data.kriterier } : prev));
      setKriterierDraft(data.kriterier);
      setMaler((prev) => prev.map((m) => (m.id === mal.id ? { ...m, kriterieCount: data.kriterier.length } : m)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre kriteriene");
    } finally {
      setSavingKriterier(false);
    }
  }

  function addSkalaEntry() {
    setSkalaDraft((prev) => [...prev, { label: "", minScore: 0 }]);
  }

  function updateSkalaEntry(index: number, patch: Partial<SkalaEntry>) {
    setSkalaDraft((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeSkalaEntry(index: number) {
    setSkalaDraft((prev) => prev.filter((_, i) => i !== index));
  }

  const skalaSorted = [...skalaDraft].sort((a, b) => a.minScore - b.minScore);
  const skalaAscendingOk = skalaSorted.every((s, i) => i === 0 || s.minScore > skalaSorted[i - 1].minScore);
  const skalaLabelsOk = skalaDraft.every((s) => s.label.trim().length > 0);

  async function saveSkala() {
    if (!mal) return;
    setSavingSkala(true);
    try {
      const sorted = [...skalaDraft].sort((a, b) => a.minScore - b.minScore);
      const data = await fetchJson<{ skala: SkalaEntry[] }>(`/api/vurdering/maler/${mal.id}/skala`, {
        method: "PUT",
        body: JSON.stringify({ skala: sorted }),
      });
      setMal((prev) => (prev ? { ...prev, skala: data.skala } : prev));
      setSkalaDraft(data.skala);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre skalaen");
    } finally {
      setSavingSkala(false);
    }
  }

  if (loadingMaler) {
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
        {maler.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
              selectedId === m.id ? "border-primary bg-primary/10 text-primary" : "border-line text-foreground/70"
            )}
          >
            {renamingId === m.id ? (
              <input
                autoFocus
                defaultValue={m.name}
                className="w-28 bg-transparent outline-none"
                onBlur={(e) => {
                  setRenamingId(null);
                  const next = e.currentTarget.value.trim();
                  if (next && next !== m.name) handleRenameMal(m.id, next);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
              />
            ) : (
              <button type="button" onClick={() => setSelectedId(m.id)} onDoubleClick={() => setRenamingId(m.id)}>
                {m.name} <span className="text-foreground/40">({m.kriterieCount})</span>
              </button>
            )}
            <button
              type="button"
              aria-label={"Slett " + m.name}
              onClick={() => handleDeleteMal(m.id)}
              className="text-foreground/30 hover:text-error"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddMal}
          className="flex items-center gap-1 rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-foreground/60 hover:border-primary hover:text-primary"
        >
          <Plus size={14} /> Ny mal
        </button>
      </div>

      {maler.length === 0 && (
        <EmptyState
          title="Ingen vurderingsmaler ennå"
          description="Lag din første mal for å komme i gang med kriterier og karakterskala."
          actionLabel="Ny mal"
          onAction={handleAddMal}
        />
      )}

      {selectedId && (loadingMal || !mal ? (
        <div className="flex justify-center py-12">
          <LoadingDots />
        </div>
      ) : (
        <>
          <Card
            header={
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Kriterier</h2>
                <span className={cn("text-sm font-medium", weightOk ? "text-success" : "text-error")}>
                  Sum vekting: {weightSum} % {weightOk ? "" : "(må bli 100 %)"}
                </span>
              </div>
            }
          >
            <div className="flex flex-col gap-3">
              {kriterierDraft.length === 0 && (
                <p className="text-sm text-foreground/50">Ingen kriterier lagt til ennå.</p>
              )}
              {kriterierDraft.map((k) => (
                <div key={k.id} className="flex flex-col gap-2 rounded-button border border-line p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Navn på kriteriet, f.eks. «Språklige virkemidler»"
                        value={k.name}
                        onChange={(e) => updateKriterium(k.id, { name: e.target.value })}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        aria-label={"Vekting for " + (k.name || "kriteriet")}
                        value={k.weight}
                        onChange={(e) => updateKriterium(k.id, { weight: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <span className="mt-2 text-sm text-foreground/50">%</span>
                    <button
                      type="button"
                      aria-label={"Fjern " + (k.name || "kriteriet")}
                      onClick={() => removeKriterium(k.id)}
                      className="mt-2 text-foreground/30 hover:text-error"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <textarea
                    placeholder="Beskrivelse av kriteriet (valgfritt)"
                    value={k.description ?? ""}
                    onChange={(e) => updateKriterium(k.id, { description: e.target.value })}
                    rows={2}
                    className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <textarea
                    placeholder="Hva er ekstra bra under dette kriteriet? F.eks. «Nevner kontrast, besjeling, sammenligning og personifikasjon OG bruker dette korrekt»"
                    value={k.ekstraBra ?? ""}
                    onChange={(e) => updateKriterium(k.id, { ekstraBra: e.target.value })}
                    rows={2}
                    className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
              <div className="flex items-center justify-between">
                <Button type="button" variant="secondary" size="sm" onClick={addKriterium}>
                  <Plus size={14} /> Nytt kriterium
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={saveKriterier}
                  loading={savingKriterier}
                  disabled={!weightOk || !kriterierNamesOk}
                >
                  Lagre kriterier
                </Button>
              </div>
              {!kriterierNamesOk && (
                <p className="text-sm text-error">Alle kriteriene må ha et navn før du kan lagre.</p>
              )}
            </div>
          </Card>

          <Card
            header={
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Karakterskala</h2>
                <span className="text-sm text-foreground/50">Du bestemmer selv poenggrensene</span>
              </div>
            }
          >
            <div className="flex flex-col gap-3">
              <p className="text-sm text-foreground/60">
                Sett minste poengsum (0-100) for hver karakter. Samme poengsum kan bety ulik karakter på ulike
                trinn - lag gjerne én mal per trinn.
              </p>
              {skalaDraft.length === 0 && (
                <p className="text-sm text-foreground/50">Ingen karaktergrenser lagt til ennå.</p>
              )}
              {skalaDraft.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-28">
                    <Input
                      placeholder="Karakter, f.eks. 3"
                      value={s.label}
                      onChange={(e) => updateSkalaEntry(i, { label: e.target.value })}
                    />
                  </div>
                  <span className="text-sm text-foreground/50">fra</span>
                  <div className="w-24">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      aria-label={"Minste poengsum for " + (s.label || "karakteren")}
                      value={s.minScore}
                      onChange={(e) => updateSkalaEntry(i, { minScore: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <span className="text-sm text-foreground/50">poeng</span>
                  <button
                    type="button"
                    aria-label={"Fjern karaktergrensen " + (s.label || "")}
                    onClick={() => removeSkalaEntry(i)}
                    className="text-foreground/30 hover:text-error"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <Button type="button" variant="secondary" size="sm" onClick={addSkalaEntry}>
                  <Plus size={14} /> Ny karaktergrense
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={saveSkala}
                  loading={savingSkala}
                  disabled={!skalaAscendingOk || !skalaLabelsOk}
                >
                  Lagre skala
                </Button>
              </div>
              {!skalaLabelsOk && <p className="text-sm text-error">Alle karaktergrensene må ha et navn.</p>}
              {skalaLabelsOk && !skalaAscendingOk && (
                <p className="text-sm text-error">To karaktergrenser kan ikke ha samme poengsum.</p>
              )}
            </div>
          </Card>
        </>
      ))}
    </div>
  );
}
