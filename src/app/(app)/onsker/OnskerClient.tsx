"use client";

import { useMemo, useState } from "react";
import { ArrowBigUp, Plus, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

interface FeatureRequestItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  authorName: string;
  createdAt: string;
  voteCount: number;
  hasVoted: boolean;
}

const CATEGORIES = [
  { value: "all", label: "Alle" },
  { value: "ny funksjon", label: "Ny funksjon" },
  { value: "forbedring", label: "Forbedring" },
  { value: "feil", label: "Feil" },
];

const STATUS_BADGE: Record<string, "neutral" | "primary" | "success"> = {
  innsendt: "neutral",
  "under vurdering": "primary",
  planlagt: "primary",
  realisert: "success",
};

export function OnskerClient({ initialRequests }: { initialRequests: FeatureRequestItem[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "ny funksjon" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () => requests.filter((r) => filter === "all" || r.category === filter),
    [requests, filter]
  );

  async function toggleVote(item: FeatureRequestItem) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === item.id
          ? { ...r, hasVoted: !r.hasVoted, voteCount: r.voteCount + (r.hasVoted ? -1 : 1) }
          : r
      )
    );
    try {
      await fetch(`/api/onsker/${item.id}/stem`, { method: item.hasVoted ? "DELETE" : "POST" });
    } catch {
      // rull tilbake ved feil
      setRequests((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? { ...r, hasVoted: item.hasVoted, voteCount: item.voteCount }
            : r
        )
      );
    }
  }

  async function submit() {
    if (!form.title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onsker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke å sende inn forslaget.");
        setSubmitting(false);
        return;
      }
      setRequests((prev) => [
        {
          id: data.request.id,
          title: data.request.title,
          description: data.request.description,
          category: data.request.category,
          status: data.request.status,
          authorName: "Deg",
          createdAt: data.request.createdAt,
          voteCount: 0,
          hasVoted: false,
        },
        ...prev,
      ]);
      setForm({ title: "", description: "", category: "ny funksjon" });
      setModalOpen(false);
      setSubmitting(false);
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setFilter(c.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium",
                filter === c.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-line text-foreground/60 hover:bg-background-subtle"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Send inn forslag
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Lightbulb size={32} />}
          title="Ingen ønsker her ennå"
          actionLabel="Send inn forslag"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((item) => (
            <li key={item.id}>
              <Card>
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => toggleVote(item)}
                    className={cn(
                      "flex w-14 shrink-0 flex-col items-center gap-0.5 rounded-button border py-2 text-sm font-semibold transition-colors",
                      item.hasVoted
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-line text-foreground/60 hover:border-primary hover:text-primary"
                    )}
                  >
                    <ArrowBigUp size={18} fill={item.hasVoted ? "currentColor" : "none"} />
                    {item.voteCount}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <Badge variant="neutral">{item.category}</Badge>
                      <Badge variant={STATUS_BADGE[item.status] ?? "neutral"}>{item.status}</Badge>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-foreground/70">{item.description}</p>
                    )}
                    <p className="mt-2 text-xs text-foreground/40">Foreslått av {item.authorName}</p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Send inn forslag">
        <div className="flex flex-col gap-4">
          <Input
            label="Tittel"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
          />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Beskrivelse (valgfritt)</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Kategori</span>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ny funksjon">Ny funksjon</option>
              <option value="forbedring">Forbedring</option>
              <option value="feil">Feil</option>
            </select>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <Button onClick={submit} loading={submitting} className="self-end">
            Send inn
          </Button>
        </div>
      </Modal>
    </div>
  );
}
