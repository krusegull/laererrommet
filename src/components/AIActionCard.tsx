"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ReportErrorButton } from "@/components/ReportErrorButton";
import { Card } from "@/components/ui/Card";

export function AIActionCard({
  endpoint,
  studentId,
  title,
  description,
  actionLabel,
  icon,
  autoLoad = false,
  resultKey = "suggestion",
}: {
  endpoint: string;
  studentId: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: ReactNode;
  autoLoad?: boolean;
  resultKey?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "error" | "done">(
    autoLoad ? "loading" : "idle"
  );
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function fetchResult() {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Noe gikk galt. Prøv igjen.");
        setState("error");
        return;
      }
      setResult(data[resultKey]);
      setState("done");
    } catch {
      setError("Nettverksfeil. Sjekk internettforbindelsen din.");
      setState("error");
    }
  }

  function run() {
    setState("loading");
    void fetchResult();
  }

  useEffect(() => {
    // Henter resultatet automatisk ved montering når autoLoad er satt.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet henting ved montering, jf. https://react.dev/reference/react/useEffect#fetching-data-with-effects
    if (autoLoad) void fetchResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-button bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-foreground/60">{description}</p>

          {state === "idle" && (
            <Button size="sm" variant="secondary" className="mt-3" onClick={run}>
              {actionLabel}
            </Button>
          )}

          {state === "loading" && (
            <div className="mt-3 flex items-center gap-2 text-primary">
              <LoadingDots />
              <span className="text-sm text-foreground/50">Tenker…</span>
            </div>
          )}

          {state === "error" && error && (
            <div className="mt-3 flex flex-col gap-2">
              <ErrorMessage message={error} onRetry={run} />
              <ReportErrorButton page={endpoint} description={`${title} feilet`} error={error} />
            </div>
          )}

          {state === "done" && result && (
            <div className="mt-3 flex flex-col gap-2">
              <p className="whitespace-pre-wrap rounded-button bg-background-subtle p-3 text-sm text-foreground">
                {result}
              </p>
              <button
                type="button"
                onClick={copyResult}
                className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Kopiert" : "Kopier"}
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
