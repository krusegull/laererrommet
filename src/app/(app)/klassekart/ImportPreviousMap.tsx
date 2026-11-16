"use client";

import { useRef, useState } from "react";
import { Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { IMAGE_MEDIA_TYPES } from "@/lib/validations";

type MediaType = (typeof IMAGE_MEDIA_TYPES)[number];

function readFileAsBase64(file: File): Promise<{ base64: string; mediaType: MediaType }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ base64, mediaType: file.type as MediaType });
    };
    reader.onerror = () => reject(new Error("Klarte ikke å lese filen"));
    reader.readAsDataURL(file);
  });
}

export function ImportPreviousMap({
  hasExistingData,
  onImported,
}: {
  hasExistingData: boolean;
  onImported: (base64: string, mediaType: MediaType) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (
      hasExistingData &&
      !window.confirm(
        "Dette erstatter rommet, pultene og elevlisten som allerede er lagt inn i denne klassen. Fortsette?"
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { base64, mediaType } = await readFileAsBase64(file);
      await onImported(base64, mediaType);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klarte ikke å importere bildet");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Card className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Sparkles size={15} className="text-primary" /> Tidligere klassekart
      </p>
      <p className="text-sm text-foreground/60">
        Last opp et klassekart du har laget før (kanskje du har en PowerPoint med klassekart) — KI-en leser av
        rom, pultgrupper og elevnavn automatisk.
      </p>
      <p className="text-xs text-foreground/50">
        Kjønn kan ikke leses av bildet og settes til en tilfeldig startverdi — husk å sjekke/rette dette i
        Elever-fanen etterpå.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="self-start"
        loading={loading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={14} /> Last opp bilde av klassekart
      </Button>
      {error && <p className="text-sm text-error">{error}</p>}
    </Card>
  );
}
