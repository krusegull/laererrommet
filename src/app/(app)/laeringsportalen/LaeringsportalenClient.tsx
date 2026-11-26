"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FAG, KONKURRANSER, konkurranseUrl, temaUrl } from "@/lib/portal/katalog";
import { buildLrPayload, lrHash } from "@/lib/portal/lrPayload";

interface ClassSummaryLite {
  id: string;
  name: string;
}

interface ClassStudentLite {
  id: string;
  name: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Noe gikk feil");
  return data;
}

export function LaeringsportalenClient() {
  const [classes, setClasses] = useState<ClassSummaryLite[]>([]);
  const [classId, setClassId] = useState("");
  const [roster, setRoster] = useState<ClassStudentLite[]>([]);
  const [className, setClassName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<{ classes: ClassSummaryLite[] }>("/api/klassekart")
      .then((data) => setClasses(data.classes))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!classId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet nullstilling når ingen klasse er valgt
      setRoster([]);
      setClassName("");
      return;
    }
    fetchJson<{ class: { name: string; students: ClassStudentLite[] } }>(`/api/klassekart/${classId}`)
      .then((data) => {
        setRoster(data.class.students);
        setClassName(data.class.name);
      })
      .catch((e) => setError(e.message));
  }, [classId]);

  function startKonkurranse(fag: string, sett: (typeof KONKURRANSER)[number]) {
    if (!classId) return;
    const payload = buildLrPayload({ classId, klasse: className, fag, studenter: roster });
    window.open(konkurranseUrl(sett) + "#" + lrHash(payload), "_blank");
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-sm text-error">{error}</p>}

      <label className="flex flex-col gap-1 text-sm sm:max-w-xs">
        <span className="font-medium text-foreground">Klasse (for å starte konkurranser)</span>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Ingen valgt</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {FAG.map((fag) => {
        const konkurranser = KONKURRANSER.filter((k) => k.fag === fag.id);
        return (
          <Card key={fag.id} className="overflow-hidden" style={{ borderTopColor: fag.farge, borderTopWidth: 3 }}>
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-semibold text-foreground">
                  <span>{fag.ikon}</span> {fag.navn}
                </h2>
                <p className="text-sm text-foreground/60">{fag.beskrivelse}</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {fag.temaer.map((tema) => (
                  <a
                    key={tema.navn}
                    href={temaUrl(tema)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 rounded-button border border-line p-3 text-sm hover:border-primary"
                  >
                    <span>{tema.ikon}</span>
                    <span>
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        {tema.navn} <ExternalLink size={12} className="text-foreground/40" />
                      </span>
                      <span className="text-foreground/60">{tema.beskrivelse}</span>
                    </span>
                  </a>
                ))}
              </div>

              {konkurranser.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-line pt-3">
                  {konkurranser.map((k) => (
                    <Button
                      key={k.id}
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={!classId}
                      onClick={() => startKonkurranse(fag.id, k)}
                    >
                      <Trophy size={14} /> {k.tittel}
                    </Button>
                  ))}
                </div>
              )}
              {konkurranser.length > 0 && !classId && (
                <p className="text-xs text-foreground/50">Velg en klasse over for å starte konkurransene.</p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
