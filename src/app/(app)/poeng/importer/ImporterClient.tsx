"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { ANDRE_FAG, MINE_FAG } from "@/lib/poeng/fag";
import { fagFraPortal, type KonkurranseResultat } from "@/lib/poeng/konkurranse";

interface ClassLite {
  id: string;
  name: string;
  students: { id: string; name: string }[];
}

interface Row {
  key: string;
  lag: string;
  navn: string;
  id: string;
  lagpoeng: number;
  egne: number;
}

type Mode = "begge" | "lag" | "egne";

const selectCls =
  "rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

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

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/** Finn klassekart-eleven en deltaker hører til: id, så fullt navn, så unikt fornavn. */
function match(row: { id: string; navn: string }, students: ClassLite["students"]): string {
  if (row.id && students.some((s) => s.id === row.id)) return row.id;
  const n = norm(row.navn);
  const exact = students.find((s) => norm(s.name) === n);
  if (exact) return exact.id;
  const first = students.filter((s) => norm(s.name).split(" ")[0] === n.split(" ")[0]);
  return first.length === 1 ? first[0].id : "";
}

export function ImporterClient({ classes }: { classes: ClassLite[] }) {
  const [data, setData] = useState<KonkurranseResultat | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [classId, setClassId] = useState("");
  const [fag, setFag] = useState("Samfunnsfag");
  const [tema, setTema] = useState("");
  const [kilde, setKilde] = useState("");
  const [dato, setDato] = useState(today());
  const [mode, setMode] = useState<Mode>("begge");
  const [divisor, setDivisor] = useState(10);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const rows: Row[] = useMemo(
    () =>
      (data?.lag ?? []).flatMap((l, li) =>
        (l.elever ?? []).map((e, ei) => ({
          key: li + "-" + ei,
          lag: String(l.navn ?? "Lag " + (li + 1)),
          navn: String(e.navn ?? ""),
          id: String(e.id ?? ""),
          lagpoeng: Number(l.poeng) || 0,
          egne: Number(e.egne) || 0,
        }))
      ),
    [data]
  );

  function applyClass(id: string, r: Row[]) {
    setClassId(id);
    const students = classes.find((c) => c.id === id)?.students ?? [];
    setLinks(Object.fromEntries(r.map((row) => [row.key, match(row, students)])));
  }

  useEffect(() => {
    const d = readHash();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resultatet ligger i #-delen av adressen, som bare finnes i nettleseren
    setData(d);
    setLoaded(true);
    if (!d) return;
    if (d.fag) setFag(fagFraPortal(d.fag) ?? (MINE_FAG as readonly string[]).find((f) => f === d.fag) ?? "Samfunnsfag");
    setTema(String(d.tema ?? ""));
    setKilde("Konkurranse" + (d.tittel ? ": " + d.tittel : ""));
    if (d.dato && /^\d{4}-\d{2}-\d{2}$/.test(d.dato)) setDato(d.dato);
    const r = d.lag.flatMap((l, li) =>
      (l.elever ?? []).map((e, ei) => ({
        key: li + "-" + ei,
        lag: "",
        navn: String(e.navn ?? ""),
        id: String(e.id ?? ""),
        lagpoeng: 0,
        egne: 0,
      }))
    );
    const start = classes.find((c) => c.id === d.classId) ?? classes[0];
    if (start) applyClass(start.id, r);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- kjøres bare én gang ved lasting
  }, []);

  function suggested(r: Row): number {
    const raw = mode === "lag" ? r.lagpoeng : mode === "egne" ? r.egne : r.lagpoeng + r.egne;
    return Math.round(raw / divisor);
  }
  const poengFor = (r: Row) => edits[r.key] ?? suggested(r);

  const students = classes.find((c) => c.id === classId)?.students ?? [];
  const used = Object.values(links).filter(Boolean);
  const dupes = new Set(used.filter((id, i) => used.indexOf(id) !== i));
  const unlinked = rows.filter((r) => !links[r.key]).length;

  async function save() {
    setError(null);
    if (!tema.trim()) return setError("Skriv periode/tema.");
    if (dupes.size) return setError("Samme elev er koblet til flere deltakere.");
    const rader = rows
      .filter((r) => links[r.key])
      .map((r) => ({ classStudentId: links[r.key], poeng: poengFor(r), gruppe: r.lag }));
    if (!rader.length) return setError("Koble minst én deltaker til en elev.");
    setSaving(true);
    try {
      const res = await fetch(`/api/klassekart/${classId}/poeng/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fag, tema, kilde, dato, rader }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error ?? "Klarte ikke å lagre");
      setDone(out.count);
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
          <p className="text-sm text-foreground/60">Du finner dem under hver elev i Tilbakemeldingsloggen og i Klassekart → Poeng.</p>
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
        description="Åpne konkurransen i Læringsportalen, gå til 🔒 Lærer og trykk «Send til Lærerrommet». Lagene må ha deltakernavn."
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

  return (
    <div className="flex flex-col gap-4">
      <Card header={<h2 className="font-semibold text-foreground">{data.tittel ? "Konkurranse: " + data.tittel : "Konkurranse"}</h2>}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Klasse</span>
            <select value={classId} onChange={(e) => applyClass(e.target.value, rows)} className={selectCls}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
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
          <Input label="Hva er poengene for?" value={kilde} onChange={(e) => setKilde(e.target.value)} />
          <Input label="Dato" type="date" value={dato} onChange={(e) => setDato(e.target.value)} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Hvilke poeng får eleven?</span>
            <select value={mode} onChange={(e) => { setMode(e.target.value as Mode); setEdits({}); }} className={selectCls}>
              <option value="begge">Lagets poeng + egne poeng</option>
              <option value="lag">Bare lagets poeng</option>
              <option value="egne">Bare egne poeng (når eleven ble trukket)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Skaler poengene</span>
            <select value={divisor} onChange={(e) => { setDivisor(Number(e.target.value)); setEdits({}); }} className={selectCls}>
              <option value={1}>Som i spillet</option>
              <option value={10}>Del på 10 (1200 → 120)</option>
              <option value={100}>Del på 100 (1200 → 12)</option>
            </select>
          </label>
        </div>
        <p className="mt-2 text-xs text-foreground/50">
          Spillet gir ofte flere tusen poeng per lag. Del på 10 eller 100 hvis du vil at konkurransen skal veie omtrent som
          vanlige plusspoeng.
        </p>
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
                <th className="py-1.5 pr-3 font-semibold">Lag + egne</th>
                <th className="py-1.5 font-semibold">Poeng som lagres</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-line last:border-0">
                  <td className="py-1.5 pr-3">{r.lag}</td>
                  <td className="py-1.5 pr-3">{r.navn}</td>
                  <td className="py-1.5 pr-3">
                    <select
                      value={links[r.key] ?? ""}
                      onChange={(e) => setLinks((p) => ({ ...p, [r.key]: e.target.value }))}
                      className={cn(selectCls, "py-1", (!links[r.key] || dupes.has(links[r.key])) && "border-error")}
                    >
                      <option value="">– ikke koblet –</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap py-1.5 pr-3 text-foreground/60">
                    {r.lagpoeng} + {r.egne}
                  </td>
                  <td className="py-1.5">
                    <input
                      type="number"
                      value={poengFor(r)}
                      onChange={(e) => setEdits((p) => ({ ...p, [r.key]: Math.round(Number(e.target.value)) || 0 }))}
                      className="w-24 rounded-button border border-line bg-background px-2 py-1 text-sm"
                      aria-label={"Poeng for " + r.navn}
                    />
                  </td>
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
