"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { KruttonnaStil, LEDNINGSFARGER, lyd } from "@/components/kruttonna/stil";

type Siste = { riktig: boolean; tekst: string; svar: string; w: string; av: string; t: number };
type Pause = { til: number; type: "desarmert" | "bom" | "slutt"; poeng: number; oppsummering: { q: string; svar: string; w: string }[] };
type Visning = {
  status: "lobby" | "spill" | "slutt";
  tittel: string;
  navn: string;
  lag: number | null;
  lagnavn: string | null;
  farge: string | null;
  medlemmer: string[];
  slutt: number | null;
  naa: number;
  spill?: {
    bombe: null | {
      nr: number; nivaa: number; idx: number; antall: number; feil: number; frist: number; start: number;
      teknikker: string; erTeknikker: boolean; sporsmal: string | null;
      mine: { i: number; tekst: string; kuttet: boolean }[];
      fordeling: { navn: string; antall: number }[];
    };
    pause: Pause | null;
    siste: Siste | null;
    poeng: number; desarmert: number; eksplodert: number; rekke: number;
  };
};

const NOKKEL = "kruttonna_token";

function lesToken() {
  try { return localStorage.getItem(NOKKEL); } catch { return null; }
}

export default function DeltaSide() {
  const [token, setToken] = useState<string | null>(null);
  const [klar, setKlar] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet: henting ved montering / tilbakestilling ved ny ledning
  useEffect(() => { setToken(lesToken()); setKlar(true); }, []);
  if (!klar) return <div className="kt-root" />;
  return (
    <div className="kt-root">
      <KruttonnaStil />
      {token ? <Spill token={token} ut={() => { try { localStorage.removeItem(NOKKEL); } catch {} setToken(null); }} /> : <BliMed ferdig={(t) => setToken(t)} />}
    </div>
  );
}

function BliMed({ ferdig }: { ferdig: (t: string) => void }) {
  const [kode, setKode] = useState("");
  const [navn, setNavn] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [laster, setLaster] = useState(false);
  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("kode");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet: henting ved montering / tilbakestilling ved ny ledning
    if (k) setKode(k.replace(/\D/g, "").slice(0, 6));
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setLaster(true);
    setFeil(null);
    const r = await fetch("/api/live/bli-med", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kode, navn }) });
    const d = await r.json().catch(() => ({}));
    setLaster(false);
    if (!r.ok) return setFeil(d.error ?? "Noe gikk galt");
    try { localStorage.setItem(NOKKEL, d.token); } catch {}
    ferdig(d.token);
  }

  return (
    <form onSubmit={send} className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-6">
      <div className="text-center">
        <div className="text-7xl">💣</div>
        <h1 className="kt-serif mt-2 text-5xl font-black text-amber-300">KRUTTØNNA</h1>
        <p className="mt-1 opacity-75">Første verdenskrig – samarbeid for å desarmere bombene</p>
      </div>
      <input inputMode="numeric" autoComplete="off" placeholder="Kode (6 siffer)" value={kode} onChange={(e) => setKode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="rounded-2xl border-2 border-amber-200/30 bg-black/30 px-5 py-4 text-center text-3xl font-black tracking-[.3em] outline-none focus:border-amber-300" />
      <input autoComplete="given-name" placeholder="Fornavnet ditt" maxLength={20} value={navn} onChange={(e) => setNavn(e.target.value)}
        className="rounded-2xl border-2 border-amber-200/30 bg-black/30 px-5 py-4 text-center text-2xl font-bold outline-none focus:border-amber-300" />
      <button disabled={laster || kode.length !== 6 || navn.trim().length < 2} className="kt-btn kt-gull text-xl">{laster ? "Kobler til …" : "Bli med! 🔥"}</button>
      {feil && <p className="text-center font-bold text-red-400">{feil}</p>}
      <p className="text-center text-xs opacity-60">Bare fornavnet ditt vises. Det slettes automatisk etter spillet.</p>
    </form>
  );
}

function Spill({ token, ut }: { token: string; ut: () => void }) {
  const [v, setV] = useState<Visning | null>(null);
  const [avvik, setAvvik] = useState(0);
  const [naa, setNaa] = useState(() => Date.now());
  const [valgt, setValgt] = useState<number | null>(null);
  const [sender, setSender] = useState(false);
  const [melding, setMelding] = useState<string | null>(null);
  const forrige = useRef<{ siste?: number; pause?: string }>({});

  const hent = useCallback(async () => {
    const r = await fetch(`/api/live/spiller?token=${encodeURIComponent(token)}`, { cache: "no-store" }).catch(() => null);
    if (!r) return;
    if (r.status === 404) return ut();
    const d = (await r.json()) as Visning;
    setAvvik(d.naa - Date.now());
    setV(d);
  }, [token, ut]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet: henting ved montering / tilbakestilling ved ny ledning
    hent();
    const t = setInterval(hent, 1000);
    const k = setInterval(() => setNaa(Date.now()), 250);
    return () => { clearInterval(t); clearInterval(k); };
  }, [hent]);

  // Lyder ved nye hendelser
  useEffect(() => {
    const s = v?.spill;
    if (!s) return;
    if (s.siste && s.siste.t !== forrige.current.siste) {
      if (forrige.current.siste !== undefined) lyd(s.siste.riktig ? "riktig" : "feil");
      forrige.current.siste = s.siste.t;
    }
    const pk = s.pause ? `${s.pause.type}-${s.pause.til}` : "";
    if (pk && pk !== forrige.current.pause) {
      if (s.pause?.type === "bom") lyd("bom");
      if (s.pause?.type === "desarmert") lyd("seier");
    }
    forrige.current.pause = pk;
  }, [v]);

  const bombeIdx = v?.spill?.bombe ? `${v.spill.bombe.nr}-${v.spill.bombe.idx}` : "";
  // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet: henting ved montering / tilbakestilling ved ny ledning
  useEffect(() => { setValgt(null); }, [bombeIdx]);

  const sekIgjen = v?.spill?.bombe ? Math.max(0, Math.ceil((v.spill.bombe.frist - (naa + avvik)) / 1000)) : 0;
  useEffect(() => {
    if (v?.spill?.bombe && sekIgjen > 0 && sekIgjen <= 10) lyd("tikk");
  }, [sekIgjen, v?.spill?.bombe]);

  async function klipp() {
    const b = v?.spill?.bombe;
    if (!b || valgt === null) return;
    setSender(true);
    const r = await fetch("/api/live/spiller", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, sporsmal: b.idx, valg: valgt }) });
    const d = await r.json().catch(() => ({}));
    setSender(false);
    setValgt(null);
    if (d.feilmelding) { setMelding(d.feilmelding); setTimeout(() => setMelding(null), 2500); }
    hent();
  }

  if (!v) return <div className="flex min-h-screen items-center justify-center text-xl opacity-70">Kobler til …</div>;

  const topp = (
    <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: `3px solid ${v.farge ?? "#555"}` }}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">💣</span>
        <div>
          <div className="text-sm font-black" style={{ color: v.farge ?? undefined }}>{v.lagnavn ? `Lag ${v.lagnavn}` : "Venter på lag"}</div>
          <div className="text-xs opacity-70">{v.navn}</div>
        </div>
      </div>
      {v.spill && (
        <div className="flex gap-3 text-right text-sm font-bold">
          <span title="Poeng">⭐ {v.spill.poeng}</span>
          <span title="Desarmerte bomber">✅ {v.spill.desarmert}</span>
          <span title="Bomber som gikk av">💥 {v.spill.eksplodert}</span>
        </div>
      )}
    </div>
  );

  if (v.status === "lobby" || !v.spill) {
    return (
      <div className="flex min-h-screen flex-col">
        {topp}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="text-6xl kt-puls">🧨</div>
          <h2 className="kt-serif text-3xl font-black">Du er med, {v.navn}!</h2>
          {v.lagnavn ? (
            <div className="kt-card kt-inn w-full max-w-md p-5">
              <div className="text-sm opacity-70">Du er på lag</div>
              <div className="kt-serif text-4xl font-black" style={{ color: v.farge ?? undefined }}>{v.lagnavn}</div>
              <div className="mt-3 flex flex-wrap justify-center gap-2">{v.medlemmer.map((m) => <span key={m} className="rounded-full bg-white/10 px-3 py-1 font-bold">{m}</span>)}</div>
              <p className="mt-4 text-sm opacity-80">Sett dere sammen! Spillet starter når læreren trykker start.</p>
            </div>
          ) : <p className="opacity-75">Vent mens læreren fordeler lagene …</p>}
        </div>
      </div>
    );
  }

  const s = v.spill;
  const b = s.bombe;
  const visSiste = s.siste && naa + avvik - s.siste.t < 5000 ? s.siste : null;

  // Pause etter bombe / slutt
  if (!b && s.pause) {
    const p = s.pause;
    const igjen = Math.max(0, Math.ceil((p.til - (naa + avvik)) / 1000));
    return (
      <div className={`flex min-h-screen flex-col ${p.type === "bom" ? "kt-rist" : ""}`}>
        {topp}
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
          {p.type === "slutt" ? (
            <div className="kt-inn text-center">
              <div className="text-7xl">🏁</div>
              <h2 className="kt-serif mt-2 text-4xl font-black text-amber-300">Spillet er over!</h2>
              <p className="mt-2 text-lg">Laget ditt desarmerte <b>{s.desarmert}</b> bomber og fikk <b>{s.poeng}</b> poeng.</p>
              <p className="mt-4 opacity-80">Se på storskjermen 👀</p>
              <button onClick={ut} className="kt-btn kt-mork mt-8 text-sm">Logg ut av spillet</button>
            </div>
          ) : (
            <>
              <div className="kt-inn text-center">
                <div className="text-7xl">{p.type === "bom" ? "💥" : "🎉"}</div>
                <h2 className={`kt-serif mt-1 text-4xl font-black ${p.type === "bom" ? "text-red-400" : "text-green-400"}`}>{p.type === "bom" ? "BOM!" : "DESARMERT!"}</h2>
                {p.type === "desarmert" ? <p className="text-xl font-bold">+{p.poeng} poeng {s.rekke > 1 && <span className="text-amber-300">🔥 {s.rekke} på rad!</span>}</p> : <p className="text-lg opacity-85">Lær av svarene – neste bombe kommer straks.</p>}
                <p className="mt-1 text-sm opacity-70">Ny bombe om {igjen} s</p>
              </div>
              <div className="mt-5 space-y-3">
                {p.oppsummering.map((o, i) => (
                  <div key={i} className="kt-card kt-inn p-4" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="text-sm opacity-75">{o.q}</div>
                    <div className="mt-1 text-lg font-black text-green-300">✔ {o.svar}</div>
                    {o.w && <div className="mt-1 text-sm opacity-80">{o.w}</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!b) return <div className="flex min-h-screen flex-col">{topp}<div className="flex flex-1 items-center justify-center text-xl opacity-70">Ny bombe lastes …</div></div>;

  const total = Math.max(1, Math.round((b.frist - b.start) / 1000));
  const andel = Math.max(0, Math.min(1, sekIgjen / total));
  const kritisk = sekIgjen <= 15;

  return (
    <div className={`flex min-h-screen flex-col ${kritisk ? "kt-blink" : ""}`}>
      {topp}
      {/* Lunte og nedtelling */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between text-sm font-bold">
          <span>Bombe {b.nr} · {"★".repeat(b.nivaa)}<span className="opacity-30">{"★".repeat(5 - b.nivaa)}</span></span>
          <span>Ledning {Math.min(b.idx + 1, b.antall)} av {b.antall}</span>
          <span>{"❌".repeat(b.feil)}<span className="opacity-30">{"✖".repeat(Math.max(0, 3 - b.feil))}</span></span>
        </div>
        <div className="relative mt-2 h-4 rounded-full bg-white/10">
          <div className="h-4 rounded-full" style={{ width: `${andel * 100}%`, background: kritisk ? "#e0483a" : "linear-gradient(90deg,#d68a1c,#f6c35a)", transition: "width .25s linear" }} />
          <span className="kt-gnist absolute -top-2 text-2xl" style={{ left: `calc(${andel * 100}% - 12px)` }}>✨</span>
        </div>
        <div className={`kt-serif mt-1 text-center text-5xl font-black ${kritisk ? "kt-puls text-red-400" : "text-amber-200"}`}>{sekIgjen}</div>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-8">
        {visSiste && (
          <div className={`kt-inn mb-3 rounded-2xl p-3 text-center font-bold ${visSiste.riktig ? "bg-green-600/30" : "bg-red-600/30"}`}>
            {visSiste.riktig ? `✅ ${visSiste.av} klippet riktig: ${visSiste.svar}` : `❌ ${visSiste.av} klippet feil ledning: «${visSiste.svar}» (−10 sek)`}
          </div>
        )}

        {b.erTeknikker && b.mine.length === 0 ? (
          <div className="kt-inn space-y-4">
            <div className="text-center"><span className="rounded-full bg-amber-400 px-4 py-1 text-sm font-black text-black">🔧 DU ER TEKNIKER</span></div>
            <div className="kt-card p-6 text-center">
              <div className="text-sm opacity-70">Les høyt for laget:</div>
              <div className="kt-serif mt-2 text-3xl font-black leading-tight">{b.sporsmal}</div>
            </div>
            <p className="text-center opacity-85">Du har ingen ledninger. Ekspertene har svarene – be dem lese opp sine, og bli enige før noen klipper!</p>
            <div className="flex flex-wrap justify-center gap-2">
              {b.fordeling.map((f) => <span key={f.navn} className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold">{f.navn}: {f.antall} 🔌</span>)}
            </div>
          </div>
        ) : (
          <div className="kt-inn space-y-4">
            {b.sporsmal ? (
              <div className="kt-card p-5 text-center"><div className="kt-serif text-2xl font-black">{b.sporsmal}</div></div>
            ) : (
              <div className="text-center">
                <span className="rounded-full bg-sky-400 px-4 py-1 text-sm font-black text-black">🧠 DU ER EKSPERT</span>
                <p className="mt-3 text-lg"><b>{b.teknikker}</b> leser spørsmålet. Les opp ledningene dine for laget – klipp bare når dere er enige!</p>
              </div>
            )}
            {b.mine.length === 0 ? (
              <div className="kt-card p-5 text-center opacity-85">Du har ingen ledninger på dette spørsmålet. Hjelp laget å tenke! 🤔</div>
            ) : (
              <div className="space-y-3">
                {b.mine.map((m) => (
                  <button key={m.i} disabled={m.kuttet || sender} onClick={() => setValgt(valgt === m.i ? null : m.i)}
                    className="kt-ledning" style={{ background: m.kuttet ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.09)", borderColor: valgt === m.i ? "#f6c35a" : "transparent", opacity: m.kuttet ? 0.35 : 1, textDecoration: m.kuttet ? "line-through" : "none" }}>
                    <span className="kt-tråd" style={{ background: LEDNINGSFARGER[m.i % LEDNINGSFARGER.length] }} />
                    <span>{m.tekst}</span>
                  </button>
                ))}
                <button onClick={klipp} disabled={valgt === null || sender} className="kt-btn kt-rod w-full text-2xl">
                  {sender ? "Klipper …" : valgt === null ? "Velg en ledning" : "✂️ KLIPP!"}
                </button>
              </div>
            )}
            {melding && <p className="text-center font-bold text-amber-300">{melding}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
