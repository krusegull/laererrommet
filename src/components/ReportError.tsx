"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Flag, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function ReportError({ error, buttonLabel = "Rapporter et problem" }: { error?: string; buttonLabel?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const timestamp = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  async function submit() {
    if (!description.trim()) return;
    setSending(true);
    try {
      await fetch("/api/feil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pathname ?? "ukjent side",
          description,
          error,
        }),
      });
      setSent(true);
      setSending(false);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setDescription("");
      }, 1200);
    } catch {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground"
      >
        <Flag size={14} />
        {buttonLabel}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Rapporter et problem">
        {sent ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center text-success">
            <Check size={28} />
            <p className="text-sm">Takk! Rapporten er sendt.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-foreground/60">
              {pathname} · {timestamp}
            </p>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">Hva prøvde du å gjøre?</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                autoFocus
                placeholder="Beskriv kort hva som skjedde…"
                className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <Button onClick={submit} loading={sending} disabled={!description.trim()} className="self-end">
              Send rapport
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
