"use client";

import { useState } from "react";
import { Copy, ExternalLink, MonitorPlay, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { PORTAL, PORTAL_URL, konkurranseUrl, portalUrl, type PortalFag, type PortalKonkurranse } from "@/lib/portal/katalog";

export interface PortalKlasse {
  id: string;
  name: string;
  students: { id: string; name: string }[];
  grupper: string[][];
  kart: string | null;
}

export function PortalClient({ klasser }: { klasser: PortalKlasse[] }) {
  const [fagId, setFagId] = useState<PortalFag["id"]>("samfunnsfag");
  const [klasseIds, setKlasseIds] = useState<string[]>(klasser[0] ? [klasser[0].id] : []);
  const [kopiert, setKopiert] = useState<string | null>(null);
  const fag = PORTAL.find((f) => f.id === fagId)!;
  const valgteKlasser = klasser.filter((k) => klasseIds.includes(k.id));

  function toggleKlasse(id: string) {
    setKlasseIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function start(k: PortalKonkurranse, tema: string) {
    if (valgteKlasser.length === 0) {
      window.open(konkurranseUrl(k.id, fag.id), "_blank", "noopener");
      return;
    }
    const alle = valgteKlasser.flatMap((kl) => kl.students.map((s) => ({ id: s.id, navn: s.name })));
    const navn = new Map(alle.map((s) => [s.id, s.navn]));
    // Grupper fra klassekartet gir bare mening når det er én klasse - med
    // flere klasser samtidig blandes lagene i stedet i selve konkurransen.
    const lag =
      valgteKlasser.length === 1
        ? valgteKlasser[0].grupper.slice(0, 8).map((g, i) => ({
            navn: "Gruppe " + (i + 1),
            elever: g.map((id) => ({ id, navn: navn.get(id) ?? "" })),
          }))
        : [];
    const lr = {
      v: 1,
      classId: valgteKlasser[0].id,
      klasse: valgteKlasser.map((kl) => kl.name).join(" + "),
      fag: fag.id,
      tema: tema.replace(/^.*– /, "").replace(/[«»]/g, ""),
      alle,
      lag,
    };
    window.open(konkurranseUrl(k.id, fag.id, lr), "_blank", "noopener");
  }

  async function kopier(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setKopiert(url);
      setTimeout(() => setKopiert(null), 2000);
    } catch {}
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="inline-flex rounded-button border border-line p-0.5">
            {PORTAL.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFagId(f.id)}
                className={cn(
                  "rounded-button px-4 py-1.5 text-sm font-medium",
                  fagId === f.id ? "bg-primary text-white" : "text-foreground/70 hover:bg-background-subtle"
                )}
              >
                {f.ikon} {f.fag}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Klasse(r) til konkurransene</span>
            {klasser.length === 0 ? (
              <p className="text-xs text-foreground/60">Ingen klasser – opprett under Klassekart</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {klasser.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => toggleKlasse(k.id)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm",
                      klasseIds.includes(k.id) ? "border-primary bg-primary/10 text-primary" : "border-line text-foreground/70"
                    )}
                  >
                    {k.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {valgteKlasser.length > 0 && (
            <p className="text-xs text-foreground/60">
              {valgteKlasser.length > 1
                ? `${valgteKlasser.length} klasser valgt - lagene blandes sammen på tvers av klassene i konkurransen.`
                : valgteKlasser[0].grupper.length
                  ? `Bruker ${valgteKlasser[0].grupper.length} grupper fra «${valgteKlasser[0].kart}». Du kan blande nye lag i konkurransen.`
                  : "Ingen grupper i klassekartet – lagene blandes tilfeldig i konkurransen."}
            </p>
          )}
          <a
            href={PORTAL_URL + "index.html"}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Åpne elevenes forside <ExternalLink size={13} />
          </a>
        </div>
      </Card>

      {fag.temaer.map((t) => (
        <Card
          key={t.navn}
          header={
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-foreground">
                {t.ikon} {t.navn}
              </h2>
              <button
                type="button"
                onClick={() => kopier(portalUrl(t.sti))}
                className="inline-flex items-center gap-1 text-xs font-medium text-foreground/60 hover:text-primary"
                title="Kopier lenken til temasiden, for å dele med elevene"
              >
                <Copy size={12} /> {kopiert === portalUrl(t.sti) ? "Kopiert!" : "Kopier elevlenke"}
              </button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {t.konkurranser.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {t.konkurranser.map((k) => (
                  <div key={k.id} className="flex flex-col gap-2 rounded-button border border-primary/30 bg-primary/5 p-3">
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className="text-primary" />
                      <span className="font-semibold text-foreground">{k.navn}</span>
                      <span className="text-xs text-foreground/50">{k.antall} spørsmål</span>
                    </div>
                    <p className="text-sm text-foreground/70">{k.beskrivelse}</p>
                    <Button size="sm" onClick={() => start(k, t.navn)} className="self-start">
                      Start{valgteKlasser.length ? " med " + valgteKlasser.map((kl) => kl.name).join(" + ") : ""}{" "}
                      <ExternalLink size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {t.verktoy.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {t.verktoy.map((v) => (
                  <a
                    key={v.sti}
                    href={portalUrl(v.sti)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col rounded-button border border-line p-3 transition-colors hover:border-primary hover:bg-background-subtle"
                  >
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      {v.storskjerm && <MonitorPlay size={14} className="text-foreground/50" />}
                      {v.navn}
                      <ExternalLink size={12} className="text-foreground/30 group-hover:text-primary" />
                    </span>
                    <span className="mt-0.5 text-xs text-foreground/60">{v.beskrivelse}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}

      <p className="text-xs text-foreground/50">
        Konkurransene åpnes i Læringsportalen i en ny fane. Etter spillet: 🔒 Lærer → «Send til Lærerrommet». Egne sett du
        lager i konkurransen, lagres bare i nettleseren du lager dem i.
      </p>
    </div>
  );
}
