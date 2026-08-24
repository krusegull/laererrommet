"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Feil e-post eller passord. Prøv igjen.");
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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-button bg-primary text-lg font-bold text-white">
            L
          </span>
          <h1 className="text-xl font-semibold text-foreground">Logg inn på Lærerrommet</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-card border border-line bg-background p-6 shadow-card">
          <Input
            label="E-post"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <Input
              label="Passord"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((show) => !show)}
              aria-label={showPassword ? "Skjul passord" : "Vis passord"}
              className="absolute right-3 top-8 text-foreground/40 hover:text-foreground/70"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <Button type="submit" loading={loading} className="mt-1">
            Logg inn
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          Har du ikke konto?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Registrer deg
          </Link>
        </p>
      </div>
    </div>
  );
}
