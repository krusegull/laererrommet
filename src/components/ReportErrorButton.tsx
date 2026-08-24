"use client";

import { useState } from "react";
import { Flag, Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function ReportErrorButton({
  page,
  description,
  error,
  className,
}: {
  page: string;
  description: string;
  error?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleClick() {
    setStatus("sending");
    try {
      await fetch("/api/feil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, description, error }),
      });
      setStatus("sent");
    } catch {
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm text-success", className)}>
        <Check size={14} /> Takk, feilen er rapportert
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "sending"}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground",
        className
      )}
    >
      <Flag size={14} />
      {status === "sending" ? "Rapporterer…" : "Rapporter feil"}
    </button>
  );
}
