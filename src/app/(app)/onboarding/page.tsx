"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, GraduationCap, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const STEPS = ["Velkommen", "Om deg", "Varsler", "Kom i gang"];

const NOTIFICATION_OPTIONS: { key: NotifyKey; label: string; description: string }[] = [
  { key: "notifyKI", label: "KI-veilederen", description: "Når KI-veilederen har svart på et spørsmål." },
  { key: "notifyChat", label: "Meldinger", description: "Når du får en direktemelding fra en kollega." },
  { key: "notifyLikes", label: "Reaksjoner", description: "Når noen liker et innlegg eller opplegg du har delt." },
  { key: "notifyCalendar", label: "Kalender", description: "Påminnelser om kommende hendelser." },
  { key: "notifyEmail", label: "E-postvarsler", description: "Få viktige varsler også på e-post." },
];

type NotifyKey = "notifyChat" | "notifyLikes" | "notifyCalendar" | "notifyKI" | "notifyEmail";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    subject: "",
    grade: "",
    school: "",
    notifyChat: true,
    notifyLikes: true,
    notifyCalendar: true,
    notifyKI: true,
    notifyEmail: false,
  });

  function toggleNotify(key: NotifyKey) {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function finish() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setError("Klarte ikke å lagre. Prøv igjen.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Noe gikk galt. Sjekk internettforbindelsen og prøv igjen.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 py-4">
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                i <= step ? "bg-primary text-white" : "bg-background-subtle text-foreground/40"
              )}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 flex-1", i < step ? "bg-primary" : "bg-line")} />
            )}
          </div>
        ))}
      </div>

      <Card>
        {step === 0 && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles size={28} />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Velkommen til Lærerrommet</h1>
              <p className="mt-2 text-foreground/60">
                Din digitale kollega for trygg KI-bruk, tilbakemeldinger til elever og faglig
                refleksjon. La oss sette opp profilen din — det tar under ett minutt.
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/10 text-primary">
                <GraduationCap size={20} />
              </span>
              <div>
                <h2 className="font-semibold text-foreground">Litt om deg</h2>
                <p className="text-sm text-foreground/60">Valgfritt — hjelper oss å tilpasse innholdet.</p>
              </div>
            </div>
            <Input
              label="Fag"
              placeholder="F.eks. Norsk, Matematikk"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            />
            <Input
              label="Trinn"
              placeholder="F.eks. 8.-10. trinn"
              value={form.grade}
              onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))}
            />
            <Input
              label="Skole"
              placeholder="F.eks. Sinsen skole"
              value={form.school}
              onChange={(e) => setForm((p) => ({ ...p, school: e.target.value }))}
            />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/10 text-primary">
                <Bell size={20} />
              </span>
              <div>
                <h2 className="font-semibold text-foreground">Velg varsler</h2>
                <p className="text-sm text-foreground/60">Du kan endre dette når som helst senere.</p>
              </div>
            </div>
            <div className="flex flex-col divide-y divide-line">
              {NOTIFICATION_OPTIONS.map((option) => (
                <label
                  key={option.key}
                  className="flex cursor-pointer items-start justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{option.label}</p>
                    <p className="text-sm text-foreground/50">{option.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form[option.key]}
                    onChange={() => toggleNotify(option.key)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 size={28} />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Du er klar!</h2>
              <p className="mt-2 text-foreground/60">
                Profilen din er satt opp. Du finner alt du trenger på dashbordet — start gjerne med
                KI-veilederen eller tilbakemeldingsloggen.
              </p>
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || loading}
        >
          Tilbake
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>Neste</Button>
        ) : (
          <Button onClick={finish} loading={loading}>
            Gå til dashbordet
          </Button>
        )}
      </div>
    </div>
  );
}
