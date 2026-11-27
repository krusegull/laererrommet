"use client";

import { useState } from "react";
import { Bomb, Users, Timer, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function StartKruttonna() {
  const [antallLag, setAntallLag] = useState(8);
  const [varighet, setVarighet] = useState(15);
  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  async function start() {
    setLaster(true);
    setFeil(null);
    const r = await fetch("/api/live", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ antallLag, varighetMin: varighet }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setFeil(d.error ?? "Noe gikk galt");
      setLaster(false);
      return;
    }
    window.location.href = `/storskjerm/${d.id}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Bomb className="h-7 w-7 text-orange-500" /> KRUTTØNNA – begrepsbomben
        </h1>
        <p className="mt-1 text-sm opacity-80">Live samarbeidsspill om første verdenskrig. Elevene blir med på egne PC-er med kode og fornavn – ingen konto.</p>
      </div>

      <Card className="space-y-3 p-5">
        <h2 className="font-semibold">Slik virker det</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li><b>Lagene får bomber</b> med fire «ledninger». Hver ledning er et spørsmål om fakta eller begrepsdefinisjoner fra prøven (Arena 9 kap. 5 – samme stoff som SKYTTERGRAVEN og FRONTLINJEN).</li>
          <li><b>Teknikeren</b> ser spørsmålet, men ingen svar. <b>Ekspertene</b> har svaralternativene fordelt på sine skjermer. Laget må snakke sammen – den som har riktig ledning, klipper.</li>
          <li><b>Rollene bytter</b> for hver bombe, så alle blir tekniker. Tre feil eller tida ute = BOM. Riktige bomber blir vanskeligere (nivå 1–5).</li>
          <li><b>Hele klassen</b> jobber mot et felles mål: hvert lag som desarmerer, skyver lunten bort fra kruttønna på storskjermen.</li>
          <li>Etter hver bombe ser laget alle svarene med forklaring. Navnene slettes automatisk etter ett døgn.</li>
        </ul>
      </Card>

      <Card className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 flex items-center gap-1 font-medium"><Users className="h-4 w-4" /> Antall lag</span>
            <select value={antallLag} onChange={(e) => setAntallLag(Number(e.target.value))} className="w-full rounded-md border border-line bg-background px-3 py-2">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n} lag</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 flex items-center gap-1 font-medium"><Timer className="h-4 w-4" /> Spilletid</span>
            <select value={varighet} onChange={(e) => setVarighet(Number(e.target.value))} className="w-full rounded-md border border-line bg-background px-3 py-2">
              {[10, 15, 20, 25, 30].map((n) => <option key={n} value={n}>{n} minutter</option>)}
            </select>
          </label>
        </div>
        <Button onClick={start} disabled={laster} className="w-full sm:w-auto">
          <MonitorPlay className="mr-2 h-4 w-4" /> {laster ? "Lager spill …" : "Åpne spillet på storskjermen"}
        </Button>
        {feil && <p className="text-sm text-error">{feil}</p>}
        <p className="text-xs opacity-70">Tips: 3–4 elever per lag fungerer best. Med 28 elever og 8 lag blir det 3–4 på hvert lag.</p>
      </Card>
    </div>
  );
}
