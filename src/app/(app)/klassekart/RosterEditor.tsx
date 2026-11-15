"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { Gender, StudentLite } from "@/lib/klassekart/types";

export function RosterEditor({
  students,
  onAdd,
  onUpdate,
  onDelete,
}: {
  students: StudentLite[];
  onAdd: (name: string, gender: Gender) => void;
  onUpdate: (id: string, patch: { name?: string; gender?: Gender }) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("gutt");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, gender);
    setName("");
  }

  return (
    <Card className="max-w-lg">
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
      </div>
    </Card>
  );
}
