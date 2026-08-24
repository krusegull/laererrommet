"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerSchema } from "@/lib/validations";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? "Klarte ikke å opprette kontoen. Prøv igjen.");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        setFormError("Kontoen ble opprettet, men innloggingen feilet. Prøv å logge inn manuelt.");
        setLoading(false);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setFormError("Noe gikk galt. Sjekk internettforbindelsen og prøv igjen.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-button bg-primary text-lg font-bold text-white">
            L
          </span>
          <h1 className="text-xl font-semibold text-foreground">Opprett en konto</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-card border border-line bg-background p-6 shadow-card">
          <Input
            label="Navn"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            error={fieldErrors.name}
          />
          <Input
            label="E-post"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            error={fieldErrors.email}
          />
          <Input
            label="Passord"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            error={fieldErrors.password}
            hint={!fieldErrors.password ? "Minst 8 tegn" : undefined}
          />
          <Input
            label="Bekreft passord"
            type="password"
            autoComplete="new-password"
            required
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            error={fieldErrors.confirmPassword}
          />

          {formError && <p className="text-sm text-error">{formError}</p>}

          <Button type="submit" loading={loading} className="mt-1">
            Opprett konto
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Har du allerede en konto?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Logg inn
          </Link>
        </p>
      </div>
    </div>
  );
}
