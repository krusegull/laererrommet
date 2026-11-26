"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Grupper, StudentLite } from "@/lib/klassekart/types";
import { KONKURRANSER, konkurranseUrl } from "@/lib/portal/katalog";
import { buildLrPayload, lrHash } from "@/lib/portal/lrPayload";

export function PoengStart({
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
  const [konkurranseId, setKonkurranseId] = useState(KONKURRANSER[0]?.id ?? "");
  const [tema, setTema] = useState("");

  const konkurranse = KONKURRANSER.find((k) => k.id === konkurranseId);
  const harGrupper = grupper.some((g) => g.length > 0);

  function startKonkurranse() {
    if (!konkurranse) return;
    const payload = buildLrPayload({
      classId,
      klasse: className,
      fag: konkurranse.fag,
      tema: tema.trim() || undefined,
      studenter: students,
      grupper,
    });
    const url = konkurranseUrl(konkurranse) + "#" + lrHash(payload);
    window.open(url, "_blank");
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-semibold text-foreground">Konkurranse</h2>
        <p className="text-sm text-foreground/60">
          Start en konkurranse fra Læringsportalen med klassen og gruppene herfra. Poengene kan sendes
          tilbake til elevenes profil (Tilbakemeldingslogg → «Poeng per fag») etter spillet.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:max-w-md">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Konkurranse</span>
          <select
            value={konkurranseId}
            onChange={(e) => setKonkurranseId(e.target.value)}
            className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {KONKURRANSER.map((k) => (
              <option key={k.id} value={k.id}>
                {k.tittel}
              </option>
            ))}
          </select>
        </label>

        <Input
          label="Tema/notat (valgfritt)"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Vises for elevene i spillet"
        />

        <p className="text-sm text-foreground/60">
          {harGrupper
            ? `Bruker siste gruppeinndeling fra «Lag grupper» (${grupper.filter((g) => g.length > 0).length} lag).`
            : "Ingen grupper er laget ennå under «Lag grupper» - hele klassen sendes med, og spillet blander selv i lag."}
        </p>

        <Button type="button" onClick={startKonkurranse} disabled={!konkurranse} className="self-start">
          <Trophy size={16} /> Start konkurranse
        </Button>
      </div>
    </div>
  );
}
