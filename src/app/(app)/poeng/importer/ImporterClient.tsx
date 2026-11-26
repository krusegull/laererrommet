"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { ANDRE_FAG, DELTAKERPOENG, MINE_FAG, PLASSERINGSPOENG } from "@/lib/poeng/fag";
import { fagFraPortal, plasseringer, type KonkurranseResultat } from "@/lib/poeng/konkurranse";

interface ClassLite {
  id: string;
  name: string;
  students: { id: string; name: string }[];
}

interface Row {
  key: string;
  lag: string;
  plass: number;
  navn: string;
  id: string;
  lagpoeng: number;
  egne: number;
  ekstra: number;
  atferd: number;
}

type Modell = "plassering" | "spill";
type Kolonne = "faglig" | "ekstra" | "atferd";

const selectCls =
  "rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const numCls = "w-20 rounded-button border border-line bg-background px-2 py-1 text-sm";

function today(): string {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function readHash(): KonkurranseResultat | null {
  const m = window.location.hash.match(/(?:^#|&)d=([^&]*)/);
  if (!m) return null;
  try {
    const d = JSON.parse(decodeURIComponent(m[1]));
    if (!d || !Array.isArray(d.lag)) return null;
    return d as KonkurranseResultat;
  } catch {
    return null;
  }
}

function toRows(d: KonkurranseResultat | null): Row[] {
  if (!d) return [];
  const plass = plasseringer(d.lag.map((l) => Number(l.poeng) || 0));
  return d.lag.flatMap((l, li) =>
    (l.elever ?? []).map((e, ei) => ({
      key: li + "-" + ei,
      lag: String(l.navn ?? "Lag " + (li + 1)),
      plass: plass[li],
      navn: String(e.navn ?? ""),
      id: String(e.id ?? ""),
      lagpoeng: Number(l.poeng) || 0,
      egne: Number(e.egne) || 0,
      ekstra: Math.max(0, Math.round(Number(e.ekstra) || 0)),
      atferd: Math.round(Number(e.atferd) || 0),
    }))
  );
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Finn klassekart-eleven en deltaker hører til - på tvers av ALLE klassene
 * læreren har, ikke bare én valgt klasse. En konkurranse kan ha deltakere fra
 * flere klasser samtidig (f.eks. en felles konkurranse for 10A og 10B).
 * Rekkefølge: id, så fullt navn, så unikt fornavn.
 */
function match(row: { id: string; navn: string }, classes: ClassLite[]): string {
  const alle = classes.flatMap((c) => c.students);
  if (row.id && alle.some((s) => s.id === row.id)) return row.id;
  const n = norm(row.navn);
  const exact = alle.find((s) => norm(s.name) === n);
  if (exact) return exact.id;
  const first = alle.filter((s) => norm(s.name).split(" ")[0] === n.split(" ")[0]);
  return first.length === 1 ? first[0].id : "";
}

export function ImporterClient({ classes }: { classes: ClassLite[] }) {
  const [data, setData] = useState<KonkurranseResultat | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [fag, setFag] = useState("Samfunnsfag");
  const [tema, setTema] = useState("");
  const [tittel, setTittel] = useState("");
  const [dato, setDato] = useState(today());
  const [modell, setModell] = useState<Modell>("plassering");
  const [plassPoeng, setPlassPoeng] = useState<number[]>([...PLASSERINGSPOENG]);
  const [deltaker, setDeltaker] = useState<number>(DELTAKERPOENG);
  const [stjerne, setStjerne] = useState(2);
  const [divisor, setDivisor] = useState(100);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const rows = useMemo(() => toRows(data), [data]);

  /** Hvilken klasse en koblet classStudentId faktisk tilhører. */
  function classOf(studentId: string): string | undefined {
    return classes.find((c) => c.students.some((s) => s.id === studentId))?.id;
  }

  useEffect(() => {
    const d = readHash();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resultatet ligger i #-delen av adressen, som bare finnes i nettleseren
    setData(d);
    setLoaded(true);
    if (!d) return;
    if (d.fag) setFag(fagFraPortal(d.fag) ?? "Samfunnsfag");
    setTema(String(d.tema ?? ""));
    setTittel(String(d.tittel ?? "Konkurranse"));
    if (d.dato && /^\d{4}-\d{2}-\d{2}$/.test(d.dato)) setDato(d.dato);
    const r = toRows(d);
    setLinks(Object.fromEntries(r.map((row) => [row.key, match(row, classes)])));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- kjøres bare én gang ved lasting
  }, []);

  function forslag(r: Row, kol: Kolonne): number {
    if (kol === "ekstra") return r.ekstra * stjerne;
    if (kol === "atferd") return r.atferd;
    if (modell === "spill") return Math.round((r.lagpoeng + r.egne) / divisor);
    return r.plass <= plassPoeng.length ? plassPoeng[r.plass - 1] : deltaker;
  }
  const verdi = (r: Row, kol: Kolonne) => edits[r.key + ":" + kol] ?? forslag(r, kol);
  const setVerdi = (r: Row, kol: Kolonne, v: number) => setEdits((p) => ({ ...p, [r.key + ":" + kol]: v }));
  const resetEdits = () => setEdits({});

  const used = Object.values(links).filter(Boolean);
  const dupes = new Set(used.filter((id, i) => used.indexOf(id) !== i));
  const unlinked = rows.filter((r) => !links[r.key]).length;

  async function save() {
    setError(null);
    if (!tema.trim()) return setError("Skriv periode/tema.");
    if (dupes.size) return setError("Samme elev er koblet til flere deltakere.");
    const navn = tittel.trim() || "Konkurranse";
    const rader = rows
      .filter((r) => links[r.key])
      .flatMap((r) => {
        const base = { classStudentId: links[r.key], gruppe: r.lag, plassering: r.plass };
        return [
          {
            ...base,
            kategori: "faglig" as const,
            poeng: verdi(r, "faglig"),
            kilde: modell === "plassering" ? r.plass + ". plass" : "Spillpoeng",
          },
          { ...base, kategori: "faglig" as const, poeng: verdi(r, "ekstra"), kilde: "⭐ Ekstrapoeng" },
          { ...base, kategori: "atferd" as const, poeng: verdi(r, "atferd"), kilde: "Atferd under konkurransen" },
        ].filter((x) => x.poeng !== 0);
      });
    if (!rader.length) return setError("Ingen poeng å lagre.");

    // Deltakerne kan høre til flere ulike klasser (f.eks. en felles
    // konkurranse for 10A og 10B) - lagre-endepunktet er scoped per klasse,
    // så vi grupperer radene per elevens faktiske klasse og lagrer én gang
    // per klasse.
    const perKlasse = new Map<string, typeof rader>();
    for (const r of rader) {
      const cid = classOf(r.classStudentId);
      if (!cid) continue;
      const liste = perKlasse.get(cid) ?? [];
      liste.push(r);
      perKlasse.set(cid, liste);
    }
    if (perKlasse.size === 0) return setError("Fant ikke klassen til noen av elevene.");

    setSaving(true);
    try {
      let total = 0;
      for (const [cid, gruppeRader] of perKlasse) {
        const res = await fetch(`/api/klassekart/${cid}/poeng/import`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fag, tema, konkurranse: navn, dato, rader: gruppeRader }),
        });
        const out = await res.json();
        if (!res.ok) throw new Error(out.error ?? "Klarte ikke å lagre");
        total += out.count;
      }
      setDone(total);
      // Fjern resultatet fra adressen så det ikke lagres to ganger ved oppdatering.
      window.history.replaceState(null, "", window.location.pathname);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å lagre");
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  if (done !== null) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 size={36} className="text-success" />
          <p className="text-lg font-semibold text-foreground">Poeng lagret for {done} elever</p>
          <p className="text-sm text-foreground/60">
            Du finner dem under hver elev i Tilbakemeldingsloggen. Gå tilbake til konkurransen og merk resultatet som sendt
            hvis du ikke allerede har gjort det.
          </p>
          <div className="flex gap-2">
            <Link href="/klassekart">
              <Button variant="secondary">Til klassekart</Button>
            </Link>
            <Link href="/logg">
              <Button>Til elevene</Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  if (!data || rows.length === 0) {
    return (
      <EmptyState
        icon={<Trophy size={32} />}
        title="Ingen konkurranseresultater å hente"
        description="Åpne konkurransen i Læringsportalen, gå til 🔒 Lærer (eller «Tidligere resultater» på startskjermen) og trykk «Send til Lærerrommet». Lagene må ha deltakernavn."
      />
    );
  }

  if (classes.length === 0) {
    return (
      <EmptyState
        icon={<Trophy size={32} />}
        title="Du har ingen klasser ennå"
        description="Opprett klassen under Klassekart først, så kan du hente poengene."
      />
    );
  }

  const lagListe = data.lag.map((l, i) => ({ navn: l.navn, poeng: l.poeng, plass: plasseringer(data.lag.map((x) => x.poeng))[i] }));

  return (
    <div className="flex flex-col gap-4">
      <Card header={<h2 className="font-semibold text-foreground">Konkurranse</h2>}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input label="Konkurranse" value={tittel} onChange={(e) => setTittel(e.target.value)} />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Fag</span>
            <select value={fag} onChange={(e) => setFag(e.target.value)} className={selectCls}>
              <optgroup label="Mine fag">
                {MINE_FAG.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </optgroup>
              <optgroup label="Andre fag">
                {ANDRE_FAG.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </optgroup>
            </select>
          </label>
          <Input label="Periode/tema" value={tema} onChange={(e) => setTema(e.target.value)} placeholder="F.eks. Første verdenskrig" />
          <Input label="Dato (kan settes tilbake i tid)" type="date" value={dato} onChange={(e) => setDato(e.target.value)} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {lagListe
            .slice()
            .sort((a, b) => a.plass - b.plass)
            .map((l) => (
              <span key={l.navn} className="rounded-full bg-background-subtle px-3 py-1">
                {l.plass}. {l.navn} <span className="text-foreground/50">({l.poeng} i spillet)</span>
              </span>
            ))}
        </div>
      </Card>

      <Card header={<h2 className="font-semibold text-foreground">Poengregler</h2>}>
        <div className="flex flex-col gap-3">
          <div className="inline-flex self-start rounded-button border border-line p-0.5">
            {(
              [
                ["plassering", "Etter plassering (anbefalt)"],
                ["spill", "Spillpoeng skalert"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setModell(k);
                  resetEdits();
                }}
                className={cn(
                  "rounded-button px-3 py-1 text-sm font-medium",
                  modell === k ? "bg-primary text-white" : "text-foreground/70 hover:bg-background-subtle"
                )}
              >
                {l}
              </button>
            ))}
          </div>

          {modell === "plassering" ? (
            <div className="flex flex-wrap items-end gap-3 text-sm">
              {plassPoeng.map((p, i) => (
                <label key={i} className="flex flex-col gap-1">
                  <span className="font-medium">{i + 1}. plass</span>
                  <input
                    type="number"
                    value={p}
                    className={numCls}
                    onChange={(e) => {
                      const v = Math.round(Number(e.target.value)) || 0;
                      setPlassPoeng((prev) => prev.map((x, j) => (j === i ? v : x)));
                      resetEdits();
                    }}
                  />
                </label>
              ))}
              <label className="flex flex-col gap-1">
                <span className="font-medium">Øvrige lag</span>
                <input
                  type="number"
                  value={deltaker}
                  className={numCls}
                  onChange={(e) => {
                    setDeltaker(Math.round(Number(e.target.value)) || 0);
                    resetEdits();
                  }}
                />
              </label>
              <span className="text-xs text-foreground/50">Poeng per elev. Lag med like mange poeng deler plass.</span>
            </div>
          ) : (
            <label className="flex max-w-xs flex-col gap-1.5 text-sm">
              <span className="font-medium">Lagpoeng + egne poeng, delt på</span>
              <select
                value={divisor}
                onChange={(e) => {
                  setDivisor(Number(e.target.value));
                  resetEdits();
                }}
                className={selectCls}
              >
                <option value={1}>1 (som i spillet)</option>
                <option value={10}>10</option>
                <option value={100}>100 (1200 → 12)</option>
              </select>
            </label>
          )}

          <label className="flex items-center gap-2 text-sm">
            <span className="font-medium">Hver ⭐ ekstrapoeng gir</span>
            <input
              type="number"
              value={stjerne}
              className={numCls}
              onChange={(e) => {
                setStjerne(Math.round(Number(e.target.value)) || 0);
                resetEdits();
              }}
            />
            <span className="text-foreground/60">poeng</span>
          </label>
          <p className="text-xs text-foreground/50">
            Atferdspoeng fra konkurransen lagres atskilt (kategori «Atferd») og merkes med konkurransens navn.
          </p>
        </div>
      </Card>

      <Card
        header={
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-foreground">Deltakere</h2>
            {unlinked > 0 && <span className="text-xs text-foreground/60">{unlinked} ikke koblet – de får ingen poeng</span>}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-foreground/50">
                <th className="py-1.5 pr-3 font-semibold">Lag</th>
                <th className="py-1.5 pr-3 font-semibold">I spillet</th>
                <th className="py-1.5 pr-3 font-semibold">Elev i klassen</th>
                <th className="py-1.5 pr-3 font-semibold">{modell === "plassering" ? "Poeng (etter plassering)" : "Spillpoeng"}</th>
                <th className="py-1.5 pr-3 font-semibold">⭐ Ekstra</th>
                <th className="py-1.5 font-semibold">Atferd ±</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap py-1.5 pr-3">
                    {r.plass}. {r.lag}
                  </td>
                  <td className="py-1.5 pr-3">
                    {r.navn}
                    {r.ekstra > 0 && <span className="ml-1 text-xs">{"⭐".repeat(Math.min(r.ekstra, 5))}</span>}
                  </td>
                  <td className="py-1.5 pr-3">
                    <select
                      value={links[r.key] ?? ""}
                      onChange={(e) => setLinks((p) => ({ ...p, [r.key]: e.target.value }))}
                      className={cn(selectCls, "py-1", (!links[r.key] || dupes.has(links[r.key])) && "border-error")}
                    >
                      <option value="">– ikke koblet –</option>
                      {classes.map((c) => (
                        <optgroup key={c.id} label={c.name}>
                          {c.students.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </td>
                  {(["faglig", "ekstra", "atferd"] as const).map((kol) => (
                    <td key={kol} className="py-1.5 pr-3">
                      <input
                        type="number"
                        value={verdi(r, kol)}
                        onChange={(e) => setVerdi(r, kol, Math.round(Number(e.target.value)) || 0)}
                        className={cn(numCls, kol === "atferd" && verdi(r, kol) < 0 && "text-error")}
                        aria-label={kol + " for " + r.navn}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <p className="mt-3 text-sm text-error">{error}</p>}
        <div className="mt-4 flex justify-end">
          <Button onClick={save} loading={saving}>
            Lagre poengene
          </Button>
        </div>
      </Card>
    </div>
  );
}
