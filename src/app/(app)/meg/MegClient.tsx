"use client";

import { useState } from "react";
import { MessageCircleHeart, CalendarRange, Gauge, Eye } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PrivateNoteItem } from "./types";
import { KollegatipsTab } from "./KollegatipsTab";
import { PerioderefleksjonTab } from "./PerioderefleksjonTab";
import { StyrkerTab } from "./StyrkerTab";
import { UtenfraTab } from "./UtenfraTab";

const TABS = [
  { key: "kollegatips", label: "Kollegatips", icon: MessageCircleHeart },
  { key: "perioderefleksjon", label: "Perioderefleksjon", icon: CalendarRange },
  { key: "styrke_svakhet", label: "Styrker og svakheter", icon: Gauge },
  { key: "utenfra", label: "Se deg selv utenfra", icon: Eye },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function MegClient({ initialNotes }: { initialNotes: PrivateNoteItem[] }) {
  const [tab, setTab] = useState<TabKey>("kollegatips");
  const [notes, setNotes] = useState(initialNotes);

  function addNote(note: PrivateNoteItem) {
    setNotes((prev) => [note, ...prev]);
  }

  function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 overflow-x-auto border-b border-line pb-px">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-foreground/60 hover:text-foreground"
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === "kollegatips" && (
        <KollegatipsTab
          notes={notes.filter((n) => n.type === "kollegatips")}
          onAdd={addNote}
          onRemove={removeNote}
        />
      )}
      {tab === "perioderefleksjon" && (
        <PerioderefleksjonTab
          notes={notes.filter((n) => n.type === "perioderefleksjon")}
          onAdd={addNote}
        />
      )}
      {tab === "styrke_svakhet" && (
        <StyrkerTab notes={notes.filter((n) => n.type === "styrke_svakhet")} onAdd={addNote} />
      )}
      {tab === "utenfra" && <UtenfraTab />}
    </div>
  );
}
