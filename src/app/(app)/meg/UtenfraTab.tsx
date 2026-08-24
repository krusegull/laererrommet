"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ReportErrorButton } from "@/components/ReportErrorButton";
import { MarkdownContent } from "@/components/MarkdownContent";

export function UtenfraTab() {
  const [state, setState] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setState("loading");
    try {
      const res = await fetch("/api/meg/refleksjon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "utenfra" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke å hente innsikt akkurat nå.");
        setState("error");
        return;
      }
      setResult(data.result);
      setState("done");
    } catch {
      setError("Nettverksfeil. Sjekk internettforbindelsen din.");
      setState("error");
    }
  }

  return (
    <Card>
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Eye size={26} />
        </span>
        <div>
          <h2 className="font-semibold text-foreground">Se deg selv utenfra</h2>
          <p className="mt-1 max-w-md text-sm text-foreground/60">
            KI-en leser gjennom alle dine private notater — kollegatips, refleksjoner og
            egenvurderinger — og hjelper deg se mønstre over tid. Ingenting herfra deles med
            noen andre.
          </p>
        </div>

        {state === "idle" && <Button onClick={run}>Se meg selv utenfra</Button>}

        {state === "loading" && (
          <div className="flex items-center gap-2 text-primary">
            <LoadingDots />
            <span className="text-sm text-foreground/50">Ser etter mønstre…</span>
          </div>
        )}

        {state === "error" && (
          <div className="flex w-full flex-col items-center gap-2">
            <ErrorMessage message={error ?? "Noe gikk galt."} onRetry={run} />
            <ReportErrorButton page="/meg" description="Se-deg-selv-utenfra feilet" error={error ?? undefined} />
          </div>
        )}

        {state === "done" && result && (
          <div className="w-full rounded-button bg-primary/5 p-4 text-left text-foreground">
            <MarkdownContent content={result} />
            <Button variant="ghost" size="sm" onClick={run} className="mt-3">
              Se på nytt
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
