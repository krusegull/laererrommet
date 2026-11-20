"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Utmerkelse } from "@/lib/vurdering/types";

interface ClassSummaryLite {
  id: string;
  name: string;
}

interface ClassStudentLite {
  id: string;
  name: string;
}

const FORSLAG_KATEGORIER = [
  "Størst faglig utvikling",
  "Beste holdninger",
  "Mest kreativ",
  "Best muntlig",
  "Beste lagspiller",
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

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function UtmerkelserEditor() {
  const [utmerkelser, setUtmerkelser] = useState<Utmerkelse[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassSummaryLite[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [formClassId, setFormClassId] = useState("");
  const [classRoster, setClassRoster] = useState<ClassStudentLite[]>([]);
  const [formClassStudentId, setFormClassStudentId] = useState("");
  const [formKategori, setFormKategori] = useState("");
  const [formBegrunnelse, setFormBegrunnelse] = useState("");
  const [formDato, setFormDato] = useState(todayIso());
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchJson<{ utmerkelser: Utmerkelse[] }>("/api/vurdering/utmerkelser"),
      fetchJson<{ classes: ClassSummaryLite[] }>("/api/klassekart"),
    ])
      .then(([utmerkelseData, classData]) => {
        setUtmerkelser(utmerkelseData.utmerkelser);
        setClasses(classData.classes);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
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

  const kjenteKategorier = useMemo(() => {
    const brukt = utmerkelser.map((u) => u.kategori);
    return Array.from(new Set([...FORSLAG_KATEGORIER, ...brukt]));
  }, [utmerkelser]);

  const grupperByKategori = useMemo(() => {
    const grupper = new Map<string, Utmerkelse[]>();
    for (const u of utmerkelser) {
      const liste = grupper.get(u.kategori) ?? [];
      liste.push(u);
      grupper.set(u.kategori, liste);
    }
    return Array.from(grupper.entries()).sort((a, b) => a[0].localeCompare(b[0], "nb"));
  }, [utmerkelser]);

  async function handleCreate() {
    if (!formClassId || !formClassStudentId || !formKategori.trim()) return;
    setCreating(true);
    try {
      const data = await fetchJson<{ utmerkelse: Utmerkelse }>("/api/vurdering/utmerkelser", {
        method: "POST",
        body: JSON.stringify({
          classId: formClassId,
          classStudentId: formClassStudentId,
          kategori: formKategori.trim(),
          begrunnelse: formBegrunnelse.trim() || undefined,
          dato: formDato,
        }),
      });
      setUtmerkelser((prev) => [data.utmerkelse, ...prev]);
      setFormOpen(false);
      setFormClassId("");
      setFormClassStudentId("");
      setFormKategori("");
      setFormBegrunnelse("");
      setFormDato(todayIso());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre utmerkelsen");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    const previous = utmerkelser;
    setUtmerkelser((prev) => prev.filter((u) => u.id !== id));
    try {
      await fetchJson(`/api/vurdering/utmerkelser/${id}`, { method: "DELETE" });
    } catch (e) {
      setUtmerkelser(previous);
      setError(e instanceof Error ? e.message : "Klarte ikke å slette utmerkelsen");
    }
  }

  if (loading) return <p className="text-sm text-foreground/60">Laster...</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Topp 5 - noteringstavle</h2>
          <p className="text-sm text-foreground/60">
            Noter elever som utmerker seg positivt i selvvalgte kategorier gjennom perioden, som grunnlag for
            kåringen. Mange ulike elever kan havne på en topp 5 - ikke bare de faglig sterkeste.
          </p>
        </div>
        <Button size="sm" onClick={() => setFormOpen((v) => !v)}>
          <Plus size={16} /> Ny notering
        </Button>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {formOpen && (
        <Card>
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-foreground">Klasse</span>
                <select
                  value={formClassId}
                  onChange={(e) => {
                    setFormClassId(e.target.value);
                    setFormClassStudentId("");
                  }}
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
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-foreground">Elev</span>
                <select
                  value={formClassStudentId}
                  onChange={(e) => setFormClassStudentId(e.target.value)}
                  disabled={!formClassId}
                  className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  <option value="">Velg elev</option>
                  {classRoster.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-foreground">Kategori</span>
              <input
                list="utmerkelse-kategorier"
                value={formKategori}
                onChange={(e) => setFormKategori(e.target.value)}
                placeholder="F.eks. Størst faglig utvikling"
                className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <datalist id="utmerkelse-kategorier">
                {kjenteKategorier.map((k) => (
                  <option key={k} value={k} />
                ))}
              </datalist>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-foreground">Begrunnelse (valgfritt)</span>
              <textarea
                value={formBegrunnelse}
                onChange={(e) => setFormBegrunnelse(e.target.value)}
                rows={2}
                placeholder="Hva var det konkret som utmerket seg?"
                className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <Input
              label="Dato"
              type="date"
              value={formDato}
              onChange={(e) => setFormDato(e.target.value)}
              className="sm:w-48"
            />

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreate}
                loading={creating}
                disabled={!formClassId || !formClassStudentId || !formKategori.trim()}
              >
                Lagre notering
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setFormOpen(false)}>
                Avbryt
              </Button>
            </div>
          </div>
        </Card>
      )}

      {utmerkelser.length === 0 ? (
        <EmptyState
          icon={<Award size={32} />}
          title="Ingen noteringer ennå"
          description="Legg til den første noteringen når en elev utmerker seg positivt."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {grupperByKategori.map(([kategori, liste]) => (
            <Card key={kategori}>
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-foreground">
                  {kategori} <span className="text-sm font-normal text-foreground/50">({liste.length})</span>
                </h3>
                <ul className="flex flex-col gap-2">
                  {liste.map((u) => (
                    <li
                      key={u.id}
                      className="flex items-start justify-between gap-3 rounded-button bg-background-subtle p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.studentName}</p>
                        {u.begrunnelse && <p className="mt-0.5 text-sm text-foreground/70">{u.begrunnelse}</p>}
                        <p className="mt-1 text-xs text-foreground/50">
                          {new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long" }).format(
                            new Date(u.dato)
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id)}
                        className="text-foreground/40 hover:text-error"
                        aria-label="Slett notering"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
