"use client";

import { useState } from "react";
import { Copy, Check, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ReportErrorButton } from "@/components/ReportErrorButton";

export function SemesterClient({
  studentId,
  studentLabel,
  hasLogs,
}: {
  studentId: string;
  studentLabel: string;
  hasLogs: boolean;
}) {
  const [state, setState] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/logg/semester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke å generere oppsummeringen.");
        setState("error");
        return;
      }
      setText(data.summary);
      setState("done");
    } catch {
      setError("Nettverksfeil. Sjekk internettforbindelsen din.");
      setState("error");
    }
  }

  async function copyText() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadText() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `semesteroppsummering-${studentLabel.replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (state === "idle") {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles size={22} />
          </span>
          {!hasLogs ? (
            <p className="text-sm text-foreground/60">
              Denne eleven har ingen tilbakemeldinger registrert ennå. Legg til minst én logg
              før du genererer en semesteroppsummering.
            </p>
          ) : (
            <>
              <p className="text-sm text-foreground/60">
                Generer et utkast basert på alle tilbakemeldinger som er registrert for{" "}
                {studentLabel}.
              </p>
              <Button onClick={generate}>Generer utkast</Button>
            </>
          )}
        </div>
      </Card>
    );
  }

  if (state === "loading") {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-10 text-primary">
          <LoadingDots />
          <p className="text-sm text-foreground/50">Skriver utkast…</p>
        </div>
      </Card>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col gap-2">
        <ErrorMessage message={error ?? "Noe gikk galt."} onRetry={generate} />
        <ReportErrorButton
          page={`/logg/${studentId}/semester`}
          description="Generering av semesteroppsummering feilet"
          error={error ?? undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={16}
        className="rounded-card border border-line bg-background p-4 text-sm leading-relaxed text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={copyText}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Kopiert" : "Kopier"}
        </Button>
        <Button variant="secondary" size="sm" onClick={downloadText}>
          <Download size={16} /> Last ned som .txt
        </Button>
        <Button variant="ghost" size="sm" onClick={generate}>
          Generer på nytt
        </Button>
      </div>
    </div>
  );
}
