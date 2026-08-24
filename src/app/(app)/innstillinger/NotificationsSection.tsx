"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import type { SettingsUser } from "./types";

const OPTIONS: { key: keyof SettingsUser; label: string; description: string }[] = [
  { key: "notifyChat", label: "Meldinger", description: "Varsel når du får en direktemelding." },
  { key: "notifyLikes", label: "Reaksjoner", description: "Varsel når noen liker noe du har delt." },
  { key: "notifyCalendar", label: "Kalender", description: "Påminnelser om kommende hendelser." },
  { key: "notifyKI", label: "KI-forslag", description: "Varsel når KI har nye forslag klare." },
];

export function NotificationsSection({ user }: { user: SettingsUser }) {
  const [values, setValues] = useState(user);
  const [error, setError] = useState<string | null>(null);

  async function toggle(key: keyof SettingsUser, next: boolean) {
    const prev = values[key];
    setValues((v) => ({ ...v, [key]: next }));
    setError(null);
    try {
      const res = await fetch("/api/innstillinger", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setValues((v) => ({ ...v, [key]: prev }));
      setError("Klarte ikke å lagre. Prøv igjen.");
    }
  }

  return (
    <Card header={<h2 className="font-semibold text-foreground">Varsler</h2>}>
      <div className="flex flex-col divide-y divide-line">
        {OPTIONS.map((option) => (
          <Toggle
            key={option.key}
            label={option.label}
            description={option.description}
            checked={Boolean(values[option.key])}
            onChange={(next) => toggle(option.key, next)}
          />
        ))}
        <Toggle
          label="E-postvarsler"
          description="Få viktige varsler også på e-post."
          checked={values.notifyEmail}
          onChange={(next) => toggle("notifyEmail", next)}
        />
      </div>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </Card>
  );
}
