"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { SettingsUser } from "./types";

export function PrivacySection({ user }: { user: SettingsUser }) {
  const { theme, setTheme } = useTheme();
  const [isPublic, setIsPublic] = useState(user.isPublic);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tilsiktet: unngår hydration-mismatch for tema, jf. https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch
    setMounted(true);
  }, []);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function toggleIsPublic(next: boolean) {
    setIsPublic(next);
    setError(null);
    try {
      const res = await fetch("/api/innstillinger", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setIsPublic(!next);
      setError("Klarte ikke å lagre. Prøv igjen.");
    }
  }

  function toggleDarkMode(next: boolean) {
    setTheme(next ? "dark" : "light");
    fetch("/api/innstillinger", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ darkMode: next }),
    }).catch(() => {});
  }

  async function deleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/innstillinger", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error ?? "Klarte ikke å slette kontoen.");
        setDeleting(false);
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setDeleteError("Nettverksfeil. Prøv igjen.");
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card header={<h2 className="font-semibold text-foreground">Personvern og konto</h2>}>
        <div className="flex flex-col divide-y divide-line">
          <Toggle
            label="Gjør profilen synlig for andre lærere"
            description="Andre kan se navn, skole, fag og bio, og sende deg meldinger."
            checked={isPublic}
            onChange={toggleIsPublic}
          />
          <Toggle
            label="Mørk modus"
            checked={mounted && theme === "dark"}
            onChange={toggleDarkMode}
          />
        </div>
        {error && <p className="mt-2 text-sm text-error">{error}</p>}
      </Card>

      <Card className="border-error/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Slett konto</p>
            <p className="mt-1 text-sm text-foreground/60">
              Dette sletter kontoen og alle data permanent. Kan ikke angres.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            Slett konto
          </Button>
        </div>
      </Card>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Slett konto">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2 rounded-button bg-error/5 p-3 text-sm text-error">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            Dette kan ikke angres. All data knyttet til kontoen din blir slettet permanent.
          </div>
          <Input
            label="Bekreft med passordet ditt"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {deleteError && <p className="text-sm text-error">{deleteError}</p>}
          <Button
            variant="danger"
            onClick={deleteAccount}
            loading={deleting}
            disabled={!password}
            className="self-end"
          >
            Slett kontoen min permanent
          </Button>
        </div>
      </Modal>
    </div>
  );
}
