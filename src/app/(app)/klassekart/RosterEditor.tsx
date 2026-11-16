"use client";

import { useState } from "react";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { Gender, StudentLite } from "@/lib/klassekart/types";

function parseNameLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function RosterEditor({
  students,
  onAdd,
  onUpdate,
  onDelete,
  onBulkAdd,
}: {
  students: StudentLite[];
  onAdd: (name: string, gender: Gender) => void;
  onUpdate: (id: string, patch: { name?: string; gender?: Gender }) => void;
  onDelete: (id: string) => void;
  onBulkAdd: (students: { name: string; gender: Gender }[]) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("gutt");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [boyNames, setBoyNames] = useState("");
  const [girlNames, setGirlNames] = useState("");
  const [bulkAdding, setBulkAdding] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, gender);
    setName("");
  }

  async function handleBulkSubmit() {
    const entries = [
      ...parseNameLines(boyNames).map((n) => ({ name: n, gender: "gutt" as Gender })),
      ...parseNameLines(girlNames).map((n) => ({ name: n, gender: "jente" as Gender })),
    ];
    if (entries.length === 0) return;
    setBulkAdding(true);
    try {
      await onBulkAdd(entries);
      setBoyNames("");
      setGirlNames("");
      setPasteOpen(false);
    } finally {
      setBulkAdding(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <div className="flex flex-col gap-2">
        {students.length === 0 && <p className="text-sm text-foreground/50">Ingen elever lagt til ennå.</p>}
        {students.map((s) => (
          <div key={s.id} className="flex items-center gap-2 rounded-button border border-line px-3 py-2">
            <span
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              className="flex-1 text-sm text-foreground outline-none"
              onBlur={(e) => {
                const next = e.currentTarget.textContent?.trim();
                if (next && next !== s.name) onUpdate(s.id, { name: next });
                else e.currentTarget.textContent = s.name;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            >
              {s.name}
            </span>
            <button
              type="button"
              onClick={() => onUpdate(s.id, { gender: s.gender === "gutt" ? "jente" : "gutt" })}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                s.gender === "gutt" ? "bg-[#eaf2fa] text-[#2f6fb3]" : "bg-[#fbebf2] text-[#c23e78]"
              )}
            >
              {s.gender === "gutt" ? "Gutt" : "Jente"}
            </button>
            <button
              type="button"
              aria-label={"Fjern " + s.name}
              onClick={() => {
                if (window.confirm(`Fjerne ${s.name} fra klassen?`)) onDelete(s.id);
              }}
              className="text-foreground/40 hover:text-error"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
          <Input
            placeholder="Navn på ny elev..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => setGender(gender === "gutt" ? "jente" : "gutt")}
            className={cn(
              "rounded-full px-2.5 py-1.5 text-xs font-medium",
              gender === "gutt" ? "bg-[#eaf2fa] text-[#2f6fb3]" : "bg-[#fbebf2] text-[#c23e78]"
            )}
          >
            {gender === "gutt" ? "Gutt" : "Jente"}
          </button>
          <Button type="submit" size="sm">
            <Plus size={14} /> Legg til
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setPasteOpen((v) => !v)}
          className="mt-1 flex items-center gap-1.5 self-start text-sm text-primary hover:underline"
        >
          <ClipboardList size={14} />
          {pasteOpen ? "Skjul liminn-liste" : "Lim inn liste med elever"}
        </button>

        {pasteOpen && (
          <div className="mt-1 flex flex-col gap-2 rounded-button border border-line p-3">
            <p className="text-xs text-foreground/60">
              Lim inn guttenavn og jentenavn hver for seg, ett navn per linje.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-foreground">Guttenavn</span>
                <textarea
                  value={boyNames}
                  onChange={(e) => setBoyNames(e.target.value)}
                  rows={6}
                  placeholder={"Noah\nJakob\nOskar"}
                  className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-foreground">Jentenavn</span>
                <textarea
                  value={girlNames}
                  onChange={(e) => setGirlNames(e.target.value)}
                  rows={6}
                  placeholder={"Emma\nNora\nElla"}
                  className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
            <Button type="button" size="sm" onClick={handleBulkSubmit} loading={bulkAdding} className="self-start">
              <Plus size={14} /> Legg til alle
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
