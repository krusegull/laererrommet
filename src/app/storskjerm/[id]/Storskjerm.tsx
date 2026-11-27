"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { KruttonnaStil, lyd } from "@/components/kruttonna/stil";

type Lag = {
  nr: number; navn: string; farge: string;
  medlemmer: { id: string; navn: string; riktige: number }[];
  poeng: number; desarmert: number; eksplodert: number; rekke: number;
  bombe: null | { nivaa: number; idx: number; antall: number; feil: number; frist: number; start: number };
  pause: null | { type: "desarmert" | "bom" | "slutt"; til: number };
};
type Data = {
  id: string; kode: string; tittel: string; status: "lobby" | "spill" | "slutt"; antallLag: number; naa: number;
  data: { start?: number; slutt?: number; varighetMin?: number; maal?: number };
  spillere: { id: string; navn: string; lag: number | null; aktiv: boolean }[];
  lag: Lag[];
};

function tid(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function Storskjerm({ id }: { id: string }) {
  const [d, setD] = useState<Data | null>(null);
  const [avvik, setAvvik] = useState(0);
  const [naa, setNaa] = useState(() => Date.now());
  const [feil, setFeil] = useState<string | null>(null);
  const [opptatt, setOpptatt] = useState(false);
  const [lydPa, setLydPa] = useState(true);
  const forrige = useRef<Record<number, string>>({});

  const hent = useCallback(async () => {
    const r = await fetch(`/api/live/${id}`, { cache: "no-store" }).catch(() => null);
    if (!r) return;
    if (r.status === 404) { setFeil("Fant ikke spillet (spill slettes etter ett døgn)."); return; }
    const j = (await r.json()) as Data;
    setAvvik(j.naa - Date.now());
    setD(j);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet: henting ved montering / tilbakestilling ved ny ledning
    hent();
    const t = setInterval(hent, 1500);
    const k = setInterval(() => setNaa(Date.now()), 250);
    return () => { clearInterval(t); clearInterval(k); };
  }, [hent]);

  // Lyd på storskjermen når et lag desarmerer eller sprenges
  useEffect(() => {
    if (!d || d.status !== "spill") return;
    for (const l of d.lag) {
      const k = l.pause ? `${l.pause.type}-${l.pause.til}` : "";
      const f = forrige.current[l.nr];
      if (k && k !== f && f !== undefined && lydPa) lyd(l.pause?.type === "bom" ? "bom" : l.pause?.type === "desarmert" ? "riktig" : "tikk");
      forrige.current[l.nr] = k;
    }
  }, [d, lydPa]);

  async function handling(body: Record<string, unknown>) {
    setOpptatt(true);
    setFeil(null);
    const r = await fetch(`/api/live/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) setFeil(j.error ?? "Noe gikk galt");
    setOpptatt(false);
    if (body.handling === "slett") { window.location.href = "/kruttonna"; return; }
    hent();
  }

  if (feil && !d) return <div className="kt-root flex items-center justify-center p-10 text-xl"><KruttonnaStil />{feil}</div>;
  if (!d) return <div className="kt-root"><KruttonnaStil /></div>;

  const host = typeof window !== "undefined" ? window.location.host : "laererrommet.vercel.app";
  const klokke = naa + avvik;

  return (
    <div className="kt-root">
      <KruttonnaStil />
      {d.status === "lobby" && <Lobby d={d} host={host} handling={handling} opptatt={opptatt} feil={feil} />}
      {d.status === "spill" && <Spill d={d} klokke={klokke} handling={handling} lydPa={lydPa} setLydPa={setLydPa} />}
      {d.status === "slutt" && <Slutt d={d} handling={handling} />}
    </div>
  );
}

function Lobby({ d, host, handling, opptatt, feil }: { d: Data; host: string; handling: (b: Record<string, unknown>) => void; opptatt: boolean; feil: string | null }) {
  const uten = d.spillere.filter((s) => s.lag === null);
  const kanStarte = d.spillere.length > 0 && uten.length === 0;
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="kt-serif text-6xl font-black text-amber-300">💣 KRUTTØNNA</h1>
          <p className="mt-1 text-xl opacity-80">Første verdenskrig – begrepsbomben</p>
        </div>
        <div className="kt-card px-8 py-5 text-center">
          <div className="text-lg opacity-80">Gå til <b className="text-amber-200">{host}/delta</b></div>
          <div className="kt-serif text-7xl font-black tracking-[.15em] text-white">{d.kode}</div>
          <div className="text-sm opacity-70">Skriv koden og fornavnet ditt</div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-2xl font-black">{d.spillere.length} elever er med</span>
        <select value={d.antallLag} onChange={(e) => handling({ handling: "antallLag", antallLag: Number(e.target.value) })} className="kt-btn kt-mork py-2">
          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n} className="text-black">{n} lag</option>)}
        </select>
        <select value={d.data.varighetMin ?? 15} onChange={(e) => handling({ handling: "varighet", varighetMin: Number(e.target.value) })} className="kt-btn kt-mork py-2">
          {[5, 10, 15, 20, 25, 30].map((n) => <option key={n} value={n} className="text-black">{n} min</option>)}
        </select>
        <button disabled={opptatt || d.spillere.length === 0} onClick={() => handling({ handling: "fordel" })} className="kt-btn kt-mork">🎲 Fordel på lag</button>
        <button disabled={opptatt || !kanStarte} onClick={() => handling({ handling: "start" })} className="kt-btn kt-gull text-xl">▶ Start spillet</button>
        <button onClick={() => { if (confirm("Avslutte og slette spillet?")) handling({ handling: "slett" }); }} className="kt-btn kt-mork ml-auto text-sm">Avbryt</button>
      </div>
      {feil && <p className="mt-2 font-bold text-red-400">{feil}</p>}

      {uten.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 font-bold opacity-80">Uten lag {d.spillere.some((s) => s.lag !== null) ? "– velg lag eller trykk «Fordel på lag»" : ""}</div>
          <div className="flex flex-wrap gap-2">
            {uten.map((s) => <Brikke key={s.id} s={s} d={d} handling={handling} />)}
          </div>
        </div>
      )}

      {d.spillere.some((s) => s.lag !== null) && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {d.lag.map((l) => {
            const m = d.spillere.filter((s) => s.lag === l.nr);
            return (
              <div key={l.nr} className="kt-card p-4" style={{ borderTop: `5px solid ${l.farge}` }}>
                <div className="kt-serif text-2xl font-black" style={{ color: l.farge }}>{l.navn}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.length ? m.map((s) => <Brikke key={s.id} s={s} d={d} handling={handling} />) : <span className="text-sm opacity-50">Ingen ennå</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Brikke({ s, d, handling }: { s: Data["spillere"][number]; d: Data; handling: (b: Record<string, unknown>) => void }) {
  return (
    <span className="kt-inn inline-flex items-center gap-1 rounded-full bg-white/10 py-1 pl-3 pr-1 font-bold">
      <span className={s.aktiv ? "" : "opacity-50"}>{s.navn}</span>
      <select value={s.lag ?? -1} onChange={(e) => handling({ handling: "flytt", spillerId: s.id, lag: Number(e.target.value) })} className="rounded-full bg-black/40 px-1 text-xs" title="Flytt til lag">
        <option value={-1}>–</option>
        {d.lag.map((l) => <option key={l.nr} value={l.nr}>{l.navn}</option>)}
      </select>
      <button title="Fjern" onClick={() => { if (confirm(`Fjerne ${s.navn}?`)) handling({ handling: "kast", spillerId: s.id }); }} className="px-1 text-xs opacity-60 hover:opacity-100">✕</button>
    </span>
  );
}

function Spill({ d, klokke, handling, lydPa, setLydPa }: { d: Data; klokke: number; handling: (b: Record<string, unknown>) => void; lydPa: boolean; setLydPa: (b: boolean) => void }) {
  const desarmert = d.lag.reduce((s, l) => s + l.desarmert, 0);
  const maal = d.data.maal ?? d.antallLag * 4;
  const andel = Math.min(1, desarmert / maal);
  const igjen = (d.data.slutt ?? klokke) - klokke;
  const rangert = [...d.lag].sort((a, b) => b.poeng - a.poeng).map((l) => l.nr);

  return (
    <div className="px-6 py-5">
      <div className="flex flex-wrap items-center gap-6">
        <h1 className="kt-serif text-4xl font-black text-amber-300">💣 KRUTTØNNA</h1>
        <div className="kt-card px-5 py-2 text-center">
          <div className="text-xs opacity-70">Tid igjen</div>
          <div className={`kt-serif text-4xl font-black ${igjen < 60000 ? "kt-puls text-red-400" : ""}`}>{tid(igjen)}</div>
        </div>
        <div className="text-sm opacity-75">Nye elever kan fortsatt bli med med kode <b className="text-amber-200">{d.kode}</b></div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setLydPa(!lydPa)} className="kt-btn kt-mork px-3 py-2 text-sm">{lydPa ? "🔊" : "🔇"}</button>
          <button onClick={() => { if (confirm("Avslutte spillet nå?")) handling({ handling: "stopp" }); }} className="kt-btn kt-mork px-4 py-2 text-sm">⏹ Avslutt</button>
        </div>
      </div>

      {/* Klassens felles lunte */}
      <div className="kt-card mt-4 p-4">
        <div className="flex items-center justify-between text-lg font-bold">
          <span>🧨 Klassens oppdrag: hold lunten unna kruttønna!</span>
          <span><b className="text-green-300">{desarmert}</b> / {maal} bomber desarmert</span>
        </div>
        <div className="relative mt-3 h-8 rounded-full bg-white/10">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-4xl">🛢️</div>
          <div className="h-8 rounded-full" style={{ width: `${(1 - andel) * 100}%`, background: "linear-gradient(90deg,#3a2a1a,#d68a1c)", transition: "width .8s ease" }} />
          <span className="kt-gnist absolute top-0 text-3xl" style={{ left: `calc(${(1 - andel) * 100}% - 16px)` }}>🔥</span>
        </div>
        <div className="mt-1 text-sm opacity-70">{andel >= 1 ? "🎉 Dere har stoppet lunten! Fortsett å samle poeng." : "Hver bombe som desarmeres, skyver flammen tilbake. Alle lag bidrar!"}</div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {d.lag.map((l) => {
          const plass = rangert.indexOf(l.nr) + 1;
          const b = l.bombe;
          const sek = b ? Math.max(0, Math.ceil((b.frist - klokke) / 1000)) : 0;
          const total = b ? Math.max(1, (b.frist - b.start) / 1000) : 1;
          const pauseAktiv = !b && l.pause && l.pause.type !== "slutt";
          return (
            <div key={l.nr} className={`kt-card relative overflow-hidden p-4 ${l.pause?.type === "bom" && pauseAktiv ? "kt-rist" : ""}`} style={{ borderTop: `6px solid ${l.farge}` }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="kt-serif text-2xl font-black" style={{ color: l.farge }}>{l.navn}</div>
                  <div className="text-xs opacity-75">{l.medlemmer.map((m) => m.navn).join(" · ") || "–"}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black">{l.poeng}</div>
                  <div className="text-xs opacity-70">{plass === 1 ? "🥇" : plass === 2 ? "🥈" : plass === 3 ? "🥉" : `#${plass}`}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-sm font-bold">
                <span>✅ {l.desarmert}</span><span>💥 {l.eksplodert}</span>{l.rekke > 1 && <span className="text-amber-300">🔥 {l.rekke} på rad</span>}
              </div>
              {b ? (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>{"★".repeat(b.nivaa)}<span className="opacity-30">{"★".repeat(5 - b.nivaa)}</span></span>
                    <span className="flex gap-1">{Array.from({ length: b.antall }, (_, i) => <span key={i} className="inline-block h-3 w-3 rounded-full" style={{ background: i < b.idx ? "#4cc46f" : i === b.idx ? "#f6c35a" : "rgba(255,255,255,.2)" }} />)}</span>
                    <span>{"❌".repeat(b.feil)}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full" style={{ width: `${(sek / total) * 100}%`, background: sek <= 15 ? "#e0483a" : "#f6c35a" }} /></div>
                  <div className={`mt-1 text-right text-sm font-black ${sek <= 15 ? "text-red-400" : "opacity-80"}`}>{sek} s</div>
                </div>
              ) : pauseAktiv ? (
                <div className={`kt-inn mt-3 rounded-xl py-3 text-center text-2xl font-black ${l.pause!.type === "bom" ? "bg-red-600/40" : "bg-green-600/40"}`}>
                  {l.pause!.type === "bom" ? "💥 BOM!" : "✅ DESARMERT!"}
                </div>
              ) : <div className="mt-3 text-center text-sm opacity-60">{l.pause?.type === "slutt" ? "Ferdig" : "Venter …"}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Slutt({ d, handling }: { d: Data; handling: (b: Record<string, unknown>) => void }) {
  const desarmert = d.lag.reduce((s, l) => s + l.desarmert, 0);
  const maal = d.data.maal ?? d.antallLag * 4;
  const rangert = [...d.lag].filter((l) => l.medlemmer.length).sort((a, b) => b.poeng - a.poeng);
  const [vis, setVis] = useState(false);
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 text-center">
      <h1 className="kt-serif text-6xl font-black text-amber-300">🏁 Spillet er over!</h1>
      <p className="mt-2 text-2xl">Klassen desarmerte <b className="text-green-300">{desarmert}</b> av {maal} bomber {desarmert >= maal ? "– dere stoppet lunten! 🎉" : ""}</p>

      <div className="mt-8 flex items-end justify-center gap-4">
        {[1, 0, 2].map((i) => {
          const l = rangert[i];
          if (!l) return <div key={i} className="w-56" />;
          const h = i === 0 ? 220 : i === 1 ? 170 : 130;
          return (
            <div key={i} className="kt-inn w-56" style={{ animationDelay: `${(2 - i) * 0.3}s` }}>
              <div className="text-5xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</div>
              <div className="kt-serif text-3xl font-black" style={{ color: l.farge }}>{l.navn}</div>
              <div className="text-sm opacity-80">{l.medlemmer.map((m) => m.navn).join(", ")}</div>
              <div className="mt-2 flex items-center justify-center rounded-t-2xl text-3xl font-black" style={{ height: h, background: `${l.farge}55`, borderTop: `6px solid ${l.farge}` }}>{l.poeng}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-2 text-left sm:grid-cols-2">
        {rangert.slice(3).map((l, i) => (
          <div key={l.nr} className="kt-card flex items-center justify-between px-4 py-2">
            <span><b>#{i + 4}</b> <span style={{ color: l.farge }} className="font-black">{l.navn}</span> <span className="text-sm opacity-70">{l.medlemmer.map((m) => m.navn).join(", ")}</span></span>
            <span className="font-black">{l.poeng} · ✅ {l.desarmert}</span>
          </div>
        ))}
      </div>

      <div className="kt-card mt-10 p-6 text-left">
        <h2 className="kt-serif text-3xl font-black text-amber-200">Men i virkeligheten …</h2>
        {!vis ? (
          <button onClick={() => setVis(true)} className="kt-btn kt-gull mt-4">Vis hva som skjedde i 1914</button>
        ) : (
          <div className="kt-inn mt-3 space-y-3 text-xl">
            <p>… klarte ingen å stoppe lunten. Etter skuddene i Sarajevo 28. juni 1914 erklærte Østerrike-Ungarn krig mot Serbia 28. juli. Alliansene dro de andre stormaktene med, og krigen varte til 1918.</p>
            <p className="font-bold">💬 Snakk sammen i laget: Hva kunne vært annerledes i 1914 for at krigen ikke skulle bryte ut? Tenk på allianser, nasjonalisme, imperialisme og militarisme.</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <button onClick={() => { window.location.href = "/kruttonna"; }} className="kt-btn kt-gull">🔁 Nytt spill</button>
        <button onClick={() => { if (confirm("Slette spillet og alle navnene nå?")) handling({ handling: "slett" }); }} className="kt-btn kt-mork">🗑️ Slett navnene nå</button>
      </div>
    </div>
  );
}
