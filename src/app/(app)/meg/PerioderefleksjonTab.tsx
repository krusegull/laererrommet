"use client";

import { useState } from "react";
import { Sparkles, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { PrivateNoteItem } from "./types";

const GRANULARITY = ["Uke", "Måned", "Termin"] as const;

export function PerioderefleksjonTab({
  notes,
  onAdd,
}: {
  notes: PrivateNoteItem[];
  onAdd: (note: PrivateNoteItem) => void;
}) {
  const [granularity, setGranularity] = useState<(typeof GRANULARITY)[number]>("Uke");
  const [periodValue, setPeriodValue] = useState("");
  const [questions, setQuestions] = useState<string | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [reflection, setReflection] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const period = periodValue ? `${granularity} ${periodValue}` : granularity;

  async function getQuestions() {
    setQuestionsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meg/refleksjon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "sporsmal", period }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke å hente spørsmål.");
        setQuestionsLoading(false);
        return;
      }
      setQuestions(data.result);
      setQuestionsLoading(false);
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
      setQuestionsLoading(false);
    }
  }

  async function saveAndSummarize() {
    if (!reflection.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const saveRes = await fetch("/api/meg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "perioderefleksjon", content: reflection, period }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        setError(saveData.error ?? "Klarte ikke å lagre refleksjonen.");
        setSaving(false);
        return;
      }
      onAdd({
        id: saveData.note.id,
        type: saveData.note.type,
        content: saveData.note.content,
        period: saveData.note.period,
        source: saveData.note.source,
        createdAt: saveData.note.createdAt,
      });

      const summaryRes = await fetch("/api/meg/refleksjon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "oppsummer", period, content: reflection }),
      });
      const summaryData = await summaryRes.json();
      if (summaryRes.ok) {
        setSummary(summaryData.result);
      }
      setReflection("");
      setSaving(false);
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">Periode</span>
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value as (typeof GRANULARITY)[number])}
                className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {GRANULARITY.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Angi hvilken (valgfritt)"
              placeholder={granularity === "Uke" ? "F.eks. 34" : granularity === "Måned" ? "F.eks. august" : "F.eks. høst 2026"}
              value={periodValue}
              onChange={(e) => setPeriodValue(e.target.value)}
              className="flex-1"
            />
          </div>

          <Button variant="secondary" size="sm" onClick={getQuestions} loading={questionsLoading} className="self-start">
            <Sparkles size={16} /> Få refleksjonsspørsmål
          </Button>

          {questions && (
            <div className="rounded-button bg-background-subtle p-3 text-foreground">
              <MarkdownContent content={questions} />
            </div>
          )}

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Din refleksjon</span>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={6}
              placeholder="Skriv fritt om perioden — hva har fungert, hva har vært krevende, hva tenker du om det?"
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          {error && <ErrorMessage message={error} onRetry={saveAndSummarize} />}

          <Button onClick={saveAndSummarize} loading={saving} disabled={!reflection.trim()} className="self-end">
            Lagre og oppsummer
          </Button>

          {saving && !summary && (
            <div className="flex items-center gap-2 text-primary">
              <LoadingDots />
              <span className="text-sm text-foreground/50">Oppsummerer…</span>
            </div>
          )}

          {summary && (
            <div className="rounded-button bg-primary/5 p-3 text-foreground">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                KI-oppsummering og forslag til fokus
              </p>
              <MarkdownContent content={summary} />
            </div>
          )}
        </div>
      </Card>

      <div>
        <h3 className="mb-3 font-semibold text-foreground">Tidligere refleksjoner</h3>
        {notes.length === 0 ? (
          <EmptyState icon={<CalendarRange size={32} />} title="Ingen refleksjoner lagret ennå" />
        ) : (
          <ul className="flex flex-col gap-3">
            {notes.map((note) => (
              <li key={note.id} className="rounded-card border border-line bg-background p-4 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  {note.period}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{note.content}</p>
                <p className="mt-2 text-xs text-foreground/40">
                  {new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" }).format(
                    new Date(note.createdAt)
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
