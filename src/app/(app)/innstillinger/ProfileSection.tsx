"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { SettingsUser } from "./types";

export function ProfileSection({ user }: { user: SettingsUser }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    school: user.school ?? "",
    subject: user.subject ?? "",
    grade: user.grade ?? "",
    bio: user.bio ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function saveProfile() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/innstillinger", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke å lagre.");
        setSaving(false);
        return;
      }
      setSaved(true);
      setSaving(false);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
      setSaving(false);
    }
  }

  async function savePassword() {
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSaved(false);

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError("De nye passordene er ikke like");
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/innstillinger/passord", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error ?? "Klarte ikke å endre passordet.");
        setPasswordSaving(false);
        return;
      }
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setPasswordSaved(true);
      setPasswordSaving(false);
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch {
      setPasswordError("Nettverksfeil. Prøv igjen.");
      setPasswordSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card header={<h2 className="font-semibold text-foreground">Profil</h2>}>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Navn"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="E-post"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
            <Input
              label="Skole"
              value={form.school}
              onChange={(e) => setForm((p) => ({ ...p, school: e.target.value }))}
            />
            <Input
              label="Fag"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            />
            <Input
              label="Trinn"
              value={form.grade}
              onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))}
            />
          </div>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Bio</span>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            {saved && (
              <span className="inline-flex items-center gap-1 text-sm text-success">
                <Check size={14} /> Lagret
              </span>
            )}
            <Button onClick={saveProfile} loading={saving}>
              Lagre
            </Button>
          </div>
        </div>
      </Card>

      <Card header={<h2 className="font-semibold text-foreground">Bytt passord</h2>}>
        <div className="flex flex-col gap-4">
          <Input
            label="Nåværende passord"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nytt passord"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
            />
            <Input
              label="Bekreft nytt passord"
              type="password"
              value={passwordForm.confirmNewPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, confirmNewPassword: e.target.value }))
              }
            />
          </div>
          {passwordError && <p className="text-sm text-error">{passwordError}</p>}
          <div className="flex items-center justify-end gap-2">
            {passwordSaved && (
              <span className="inline-flex items-center gap-1 text-sm text-success">
                <Check size={14} /> Passord endret
              </span>
            )}
            <Button
              onClick={savePassword}
              loading={passwordSaving}
              disabled={!passwordForm.currentPassword || !passwordForm.newPassword}
            >
              Oppdater passord
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
