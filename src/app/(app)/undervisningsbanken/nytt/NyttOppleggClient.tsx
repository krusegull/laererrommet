"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LESSON_PLAN_SUBJECTS, LESSON_PLAN_GRADE_BANDS } from "@/lib/validations";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function NyttOppleggClient() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<string>(LESSON_PLAN_SUBJECTS[0]);
  const [grade, setGrade] = useState<string>(LESSON_PLAN_GRADE_BANDS[0]);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.size > MAX_FILE_SIZE) {
      setError("Filen er for stor (maks 10 MB).");
      e.target.value = "";
      setFile(null);
      return;
    }
    setError(null);
    setFile(selected);
  }

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      setError("Fyll ut tittel og beskrivelse.");
      return;
    }
    if (!rightsConfirmed) {
      setError("Du må bekrefte at du har rett til å dele dette innholdet.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("subject", subject);
    formData.set("grade", grade);
    formData.set("description", description);
    if (content.trim()) formData.set("content", content);
    formData.set("rightsConfirmed", "true");
    if (file) formData.set("file", file);

    try {
      const res = await fetch("/api/undervisningsbanken", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke å dele opplegget.");
        setSubmitting(false);
        return;
      }
      router.push(`/undervisningsbanken/${data.plan.id}`);
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <Input label="Tittel" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Fag</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {LESSON_PLAN_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Trinn</span>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {LESSON_PLAN_GRADE_BANDS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Kort beskrivelse</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Hva går opplegget ut på, og hvem passer det for?"
            className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Innhold (valgfritt)</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Skriv ut opplegget her, eller last opp en fil under i stedet."
            className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Fil (valgfritt)</span>
          <div className="flex items-center gap-2 rounded-button border border-dashed border-line px-3 py-3 text-sm text-foreground/60">
            <Upload size={16} className="shrink-0" />
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="w-full text-sm file:mr-3 file:rounded-button file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
            />
          </div>
          <span className="text-xs text-foreground/40">PDF, Word, PowerPoint eller bilde. Maks 10 MB.</span>
        </label>

        <label className="flex items-start gap-2 text-sm text-foreground/70">
          <input
            type="checkbox"
            checked={rightsConfirmed}
            onChange={(e) => setRightsConfirmed(e.target.checked)}
            className="mt-0.5 accent-[var(--color-primary)]"
          />
          Jeg bekrefter at jeg har rett til å dele dette innholdet med andre lærere.
        </label>

        {error && <p className="text-sm text-error">{error}</p>}

        <Button onClick={handleSubmit} loading={submitting} className="self-end">
          Del opplegg
        </Button>
      </div>
    </Card>
  );
}
