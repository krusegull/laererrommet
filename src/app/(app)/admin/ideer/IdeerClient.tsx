"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { IDEA_CATEGORIES } from "@/lib/validations";
import { cn } from "@/lib/cn";

interface Idea {
  id: string;
  title: string;
  description: string | null;
  category: string;
  realized: boolean;
  createdAt: string;
}

type Filter = "all" | "urealiserte" | "realiserte";

export function IdeerClient({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "Annet" });
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    return ideas.filter((idea) => {
      const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "realiserte" && idea.realized) ||
        (filter === "urealiserte" && !idea.realized);
      return matchesSearch && matchesFilter;
    });
  }, [ideas, search, filter]);

  async function toggleRealized(idea: Idea) {
    setIdeas((prev) =>
      prev.map((i) => (i.id === idea.id ? { ...i, realized: !i.realized } : i))
    );
    try {
      await fetch(`/api/admin/ideer/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ realized: !idea.realized }),
      });
    } catch {
      setIdeas((prev) =>
        prev.map((i) => (i.id === idea.id ? { ...i, realized: idea.realized } : i))
      );
    }
  }

  async function addIdea() {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/ideer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setIdeas((prev) => [
          {
            id: data.idea.id,
            title: data.idea.title,
            description: data.idea.description,
            category: data.idea.category,
            realized: data.idea.realized,
            createdAt: data.idea.createdAt,
          },
          ...prev,
        ]);
        setForm({ title: "", description: "", category: "Annet" });
        setModalOpen(false);
      }
      setSubmitting(false);
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <Input placeholder="Søk…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Alle</option>
            <option value="urealiserte">Urealiserte</option>
            <option value="realiserte">Realiserte</option>
          </select>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Legg til ny idé
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Lightbulb size={32} />}
          title="Ingen ideer her"
          actionLabel="Legg til ny idé"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((idea) => (
            <li key={idea.id}>
              <Card>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={idea.realized}
                    onChange={() => toggleRealized(idea)}
                    className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={cn("font-medium text-foreground", idea.realized && "line-through text-foreground/40")}>
                        {idea.title}
                      </p>
                      <Badge variant="neutral">{idea.category}</Badge>
                      {idea.realized && <Badge variant="success">Realisert</Badge>}
                    </div>
                    {idea.description && (
                      <p className="mt-1 text-sm text-foreground/60">{idea.description}</p>
                    )}
                  </div>
                </label>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Legg til ny idé">
        <div className="flex flex-col gap-4">
          <Input
            label="Tittel"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Beskrivelse (valgfritt)</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Kategori</span>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {IDEA_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={addIdea} loading={submitting} className="self-end">
            Legg til
          </Button>
        </div>
      </Modal>
    </div>
  );
}
