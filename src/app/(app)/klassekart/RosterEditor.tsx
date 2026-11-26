"use client";

import { useState } from "react";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { Gender, StudentLite } from "@/lib/klassekart/types";

/** Ett navn per linje. Fjerner nummerering («1. », «2) ») og linjer som «Totalt: 28 elever». */
function parseNameLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\d+\s*[.)]\s*/, "").trim())
    // Hopp over overskrifter («10A:») og oppsummeringer («Totalt: 28 elever»).
    .filter((line) => line && !line.endsWith(":") && !/^totalt\b/i.test(line));
}

const GENDER_NEXT: Record<Gender, Gender> = { gutt: "jente", jente: "ukjent", ukjent: "gutt" };
const GENDER_LABEL: Record<Gender, string> = { gutt: "Gutt", jente: "Jente", ukjent: "–" };
const GENDER_CLASS: Record<Gender, string> = {
  gutt: "bg-[#eaf2fa] text-[#2f6fb3]",
  jente: "bg-[#fbebf2] text-[#c23e78]",
  ukjent: "bg-background-subtle text-foreground/50",
};

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
  const [gender, setGender] = useState<Gender>("ukjent");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [allNames, setAllNames] = useState("");
  const [splitGender, setSplitGender] = useState(false);
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
    const entries = splitGender
      ? [
          ...parseNameLines(boyNames).map((n) => ({ name: n, gender: "gutt" as Gender })),
          ...parseNameLines(girlNames).map((n) => ({ name: n, gender: "jente" as Gender })),
        ]
      : parseNameLines(allNames).map((n) => ({ name: n, gender: "ukjent" as Gender }));
    if (entries.length === 0) return;
    setBulkAdding(true);
    try {
      await onBulkAdd(entries);
      setAllNames("");
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
              onClick={() => onUpdate(s.id, { gender: GENDER_NEXT[s.gender] ?? "gutt" })}
              title="Trykk for å endre kjønn (gutt, jente eller ikke satt)"
              className={cn("rounded-full px-2.5 py-1 text-xs font-medium", GENDER_CLASS[s.gender] ?? GENDER_CLASS.ukjent)}
            >
              {GENDER_LABEL[s.gender] ?? "–"}
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
            onClick={() => setGender(GENDER_NEXT[gender])}
            className={cn(
              "rounded-full px-2.5 py-1.5 text-xs font-medium",
              GENDER_CLASS[gender]
            )}
            title="Kjønn: trykk for å endre (gutt, jente eller ikke satt)"
          >
            {gender === "ukjent" ? "Kjønn –" : GENDER_LABEL[gender]}
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
            {!splitGender ? (
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-foreground">Hele elevlista</span>
                <span className="text-xs text-foreground/60">
                  Ett navn per linje. Nummerering (1., 2., …), overskrifter og en «Totalt»-linje fjernes automatisk.
                </span>
                <textarea
                  value={allNames}
                  onChange={(e) => setAllNames(e.target.value)}
                  rows={10}
                  placeholder={"1. Aisha\n2. Jonas\n3. Emma"}
                  className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {allNames.trim() && (
                  <span className="text-xs text-foreground/60">{parseNameLines(allNames).length} elever</span>
                )}
              </label>
            ) : (
            <>
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
            </>
            )}
            <button
              type="button"
              onClick={() => setSplitGender((v) => !v)}
              className="self-start text-xs text-primary hover:underline"
            >
              {splitGender ? "Lim inn hele lista uten kjønn" : "Vil du registrere kjønn? Lim inn gutter og jenter hver for seg"}
            </button>
            <Button type="button" size="sm" onClick={handleBulkSubmit} loading={bulkAdding} className="self-start">
              <Plus size={14} /> Legg til alle
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
