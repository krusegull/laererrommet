"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Plus, Trophy, Undo2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { ANDRE_FAG, MINE_FAG } from "@/lib/poeng/fag";
import { portalFagId } from "@/lib/poeng/konkurranse";
import { konkurranseUrl, konkurranserFor } from "@/lib/portal/katalog";
import type { Grupper, StudentLite } from "@/lib/klassekart/types";

interface Batch {
  batchId: string;
  fag: string;
  kategori: string;
  poeng: number;
  tema: string;
  kilde: string;
  gruppe: string | null;
  dato: string;
  elever: string[];
}

type Kategori = "faglig" | "atferd";
// Skala: en konkurranseseier gir 10 poeng per elev, så vanlige plusspoeng er små.
const QUICK: Record<Kategori, number[]> = { faglig: [1, 2, 5, 10], atferd: [-5, -2, -1, 1, 2, 5] };
const LS_KEY = "laererrommet-poeng-skjema";

function today(): string {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function readSaved(): { fag?: string; tema?: string; kilde?: string } {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "null") ?? {};
  } catch {
    return {};
  }
}

const fmtDate = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" });

export function PoengEditor({
  classId,
  className,
  students,
  grupper,
}: {
  classId: string;
  className: string;
  students: StudentLite[];
  grupper: Grupper;
}) {
  // Husk fag/tema/kilde mellom besøk - læreren gir ofte poeng i samme tema
  // mange timer på rad. (Fanen vises bare etter at klassen er hentet på
  // klienten, så localStorage er alltid tilgjengelig her.)
  const [saved] = useState(readSaved);
  const [fag, setFag] = useState<string>(saved.fag ?? "Samfunnsfag");
  const [tema, setTema] = useState(saved.tema ?? "");
  const [kilde, setKilde] = useState(saved.kilde ?? "");
  const [kategori, setKategori] = useState<Kategori>("faglig");
  const [poeng, setPoeng] = useState(2);
  const [dato, setDato] = useState(today());
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<Batch[]>([]);
  const [temaer, setTemaer] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ fag, tema, kilde }));
    } catch {}
  }, [fag, tema, kilde]);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/klassekart/${classId}/poeng?fag=${encodeURIComponent(fag)}&kategori=${kategori}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Klarte ikke å hente poeng");
      setTotals(data.totals);
      setRecent(data.recent);
      setTemaer(data.temaer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å hente poeng");
    }
  }, [classId, fag, kategori]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet henting når fag/klasse endres
    load();
  }, [load]);

  const nameOf = new Map(students.map((s) => [s.id, s.name]));
  const validGroups = grupper
    .map((g, i) => ({ label: "Gruppe " + (i + 1), ids: g.filter((id) => nameOf.has(id)) }))
    .filter((g) => g.ids.length > 0);

  // Åpner konkurransemalen i Læringsportalen med disse gruppene som lag.
  // Lagene sendes i #-delen av adressen, som aldri går til noen server.
  const ferdige = konkurranserFor(fag);
  const [sett, setSett] = useState<string>("");
  const valgtSett = ferdige.find((k) => k.id === sett) ?? ferdige[0];

  function startKonkurranse() {
    const id = portalFagId(fag);
    const settId = valgtSett?.id ?? id;
    const temaForLr = tema || valgtSett?.tema || "";
    const lr = {
      v: 1,
      classId,
      klasse: className,
      fag: id,
      tema: temaForLr,
      // Hele klassen, så konkurransen kan blande nye lag selv.
      alle: students.map((st) => ({ id: st.id, navn: st.name })),
      lag: validGroups.slice(0, 8).map((g) => ({
        navn: g.label,
        elever: g.ids.map((sid) => ({ id: sid, navn: nameOf.get(sid) ?? "" })),
      })),
    };
    const url = konkurranseUrl(settId, id, lr);
    window.open(url, "_blank", "noopener");
  }

  async function give(ids: string[], key: string, gruppe?: string) {
    setError(null);
    if (!tema.trim()) {
      setError("Skriv periode/tema før du gir poeng.");
      return;
    }
    setBusy(key);
    try {
      const res = await fetch(`/api/klassekart/${classId}/poeng`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classStudentIds: ids, fag, poeng, tema, kilde, gruppe, dato, kategori }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Klarte ikke å gi poeng");
      const who = gruppe ?? (ids.length === 1 ? nameOf.get(ids[0]) : ids.length + " elever");
      setFlash((poeng > 0 ? "+" : "") + poeng + (kategori === "atferd" ? " atferd" : "") + " til " + who);
      setTimeout(() => setFlash(null), 2500);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å gi poeng");
    } finally {
      setBusy(null);
    }
  }

  async function undo(batchId: string) {
    setBusy("undo-" + batchId);
    try {
      const res = await fetch(`/api/klassekart/${classId}/poeng?batch=${encodeURIComponent(batchId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Klarte ikke å angre");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å angre");
    } finally {
      setBusy(null);
    }
  }

  const ranking = [...students].sort((a, b) => (totals[b.id] ?? 0) - (totals[a.id] ?? 0));
  const groupTotals = validGroups
    .map((g) => ({ ...g, sum: g.ids.reduce((s, id) => s + (totals[id] ?? 0), 0) }))
    .sort((a, b) => b.sum - a.sum);

  return (
    <div className="flex flex-col gap-4">
      <Card
        header={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground">Gi poeng</h3>
            <div className="inline-flex rounded-button border border-line p-0.5">
              {(["faglig", "atferd"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setKategori(k);
                    setPoeng(k === "faglig" ? 2 : 1);
                  }}
                  className={cn(
                    "rounded-button px-3 py-1 text-sm font-medium",
                    kategori === k ? "bg-primary text-white" : "text-foreground/70 hover:bg-background-subtle"
                  )}
                >
                  {k === "faglig" ? "Faglige plusspoeng" : "Atferd (±)"}
                </button>
              ))}
            </div>
          </div>
        }
      >
        {kategori === "atferd" && (
          <p className="mb-3 rounded-button bg-amber-500/10 px-3 py-2 text-sm text-foreground/80">
            Atferdspoeng vises atskilt på eleven og blandes ikke med de faglige poengene. Bruk minus for negativ atferd.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Fag</span>
            <select
              value={fag}
              onChange={(e) => setFag(e.target.value)}
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
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
          <div>
            <Input
              label="Periode/tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="F.eks. Første verdenskrig"
              list="poeng-temaer"
            />
            <datalist id="poeng-temaer">
              {temaer.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
          <Input
            label="Hva er poengene for? (valgfritt)"
            value={kilde}
            onChange={(e) => setKilde(e.target.value)}
            placeholder="F.eks. Konkurranse, godt samarbeid"
          />
          <Input label="Dato" type="date" value={dato} onChange={(e) => setDato(e.target.value)} />
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <span className="mr-1 text-sm font-medium text-foreground">Poeng:</span>
          {QUICK[kategori].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setPoeng(q)}
              className={cn(
                "rounded-button border px-3 py-1.5 text-sm font-semibold transition-colors",
                poeng === q
                  ? q < 0
                    ? "border-error bg-error text-white"
                    : "border-primary bg-primary text-white"
                  : "border-line text-foreground hover:bg-background-subtle"
              )}
            >
              {q > 0 ? "+" : ""}
              {q}
            </button>
          ))}
          <input
            type="number"
            value={poeng}
            onChange={(e) => setPoeng(Number(e.target.value))}
            aria-label="Eget antall poeng"
            className="w-24 rounded-button border border-line bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
          {flash && <span className="ml-2 text-sm font-semibold text-success">✓ {flash}</span>}
        </div>
        {error && <p className="mt-2 text-sm text-error">{error}</p>}
      </Card>

      <Card
        header={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">Grupper</h3>
              <span className="text-xs text-foreground/50">Fra «Lag grupper» i dette kartet</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
            {ferdige.length > 0 ? (
              <select
                value={valgtSett?.id ?? ""}
                onChange={(e) => setSett(e.target.value)}
                aria-label="Velg konkurranse"
                className="rounded-button border border-line bg-background px-2 py-1.5 text-sm text-foreground"
              >
                {ferdige.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.navn} – {k.tema} ({k.antall} spm.)
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-foreground/50">Ingen ferdige konkurranser i {fag} – du lager spørsmålene selv</span>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={startKonkurranse}
              disabled={students.length < 2}
              title="Åpner konkurransen med disse gruppene (maks 8). Du kan også blande nye lag der."
            >
              <Trophy size={14} /> Start konkurranse <ExternalLink size={12} />
            </Button>
            </div>
          </div>
        }
      >
        {validGroups.length === 0 ? (
          <p className="text-sm text-foreground/60">
            Ingen grupper i dette kartet ennå. Lag grupper under «Lag grupper», gi poeng til enkeltelever nedenfor, eller trykk «Start konkurranse» og bland lagene der.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {validGroups.map((g) => (
              <div key={g.label} className="flex flex-col gap-2 rounded-button border border-line p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{g.label}</span>
                  <span className="text-sm text-foreground/60">
                    {g.ids.reduce((s, id) => s + (totals[id] ?? 0), 0)} p
                  </span>
                </div>
                <p className="text-sm text-foreground/70">{g.ids.map((id) => nameOf.get(id)).join(", ")}</p>
                <Button size="sm" loading={busy === g.label} onClick={() => give(g.ids, g.label, g.label)}>
                  <Users size={14} /> {poeng > 0 ? "+" : ""}
                  {poeng} til hele gruppa
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        header={
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground">Enkeltelever</h3>
            <Button
              size="sm"
              variant="secondary"
              loading={busy === "alle"}
              onClick={() => give(students.map((s) => s.id), "alle", "Hele klassen")}
              disabled={students.length === 0}
            >
              <Plus size={14} /> Hele klassen
            </Button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          {students.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={busy !== null}
              onClick={() => give([s.id], s.id)}
              className="inline-flex items-center gap-2 rounded-button border border-line px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-60"
            >
              {s.name}
              <span className="rounded-full bg-background-subtle px-2 text-xs font-semibold text-foreground/70">
                {totals[s.id] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          header={
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
              <Trophy size={16} /> {kategori === "atferd" ? "Atferd" : "Poengtavle"} – {fag}
            </h3>
          }
        >
          {groupTotals.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/50">Grupper</p>
              <ol className="flex flex-col gap-1 text-sm">
                {groupTotals.map((g, i) => (
                  <li key={g.label} className="flex justify-between">
                    <span>
                      {i + 1}. {g.label}
                    </span>
                    <span className="font-semibold">{g.sum} p</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/50">Elever</p>
          <ol className="flex flex-col gap-1 text-sm">
            {ranking.map((s, i) => (
              <li key={s.id} className="flex justify-between">
                <span>
                  {i + 1}. {s.name}
                </span>
                <span className="font-semibold">{totals[s.id] ?? 0} p</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-foreground/50">
            Summen er alle elevens {kategori === "atferd" ? "atferdspoeng" : "faglige poeng"} i faget. Detaljer per elev finner
            du i Tilbakemeldingslogg → eleven.
          </p>
        </Card>

        <Card header={<h3 className="font-semibold text-foreground">Siste tildelinger</h3>}>
          {recent.length === 0 ? (
            <p className="text-sm text-foreground/60">Ingen poeng gitt i denne klassen ennå.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {recent.map((b) => (
                <li key={b.batchId} className="flex items-start justify-between gap-2 border-b border-line pb-2 text-sm last:border-0">
                  <div>
                    <p className="font-medium text-foreground">
                      {b.poeng > 0 ? "+" : ""}
                      {b.poeng}
                      {b.kategori === "atferd" ? " atferd" : ""} · {b.gruppe ?? b.elever.join(", ")}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {fmtDate.format(new Date(b.dato))} · {b.fag} · {b.tema}
                      {b.kilde ? " · " + b.kilde : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={busy === "undo-" + b.batchId}
                    onClick={() => undo(b.batchId)}
                    title="Angre hele tildelingen"
                  >
                    <Undo2 size={14} /> Angre
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
