"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { RoomObject } from "@/lib/klassekart/types";
import { RoomCanvas } from "./RoomCanvas";
import { LABELS, RoomIcon } from "./icons";

const PALETTE: RoomObject["type"][] = ["dor", "tavle", "vindu", "kateter", "laerer", "bokhylle"];

export function RoomEditor({
  roomObjects,
  onChange,
}: {
  roomObjects: RoomObject[];
  onChange: (next: RoomObject[]) => void;
}) {
  const [customName, setCustomName] = useState("");

  function addObject(type: RoomObject["type"], label: string) {
    // Plassert forskjøvet etter antall gjenstander (ikke tilfeldig) - rene
    // posisjoner uten tilfeldighet gjør at komponenten forblir forutsigbar.
    // Læreren drar den dit den faktisk skal stå rett etterpå.
    const offset = roomObjects.length % 6;
    const obj: RoomObject = {
      id: crypto.randomUUID(),
      type,
      label,
      x: 20 + offset * 11,
      y: 20 + Math.floor(roomObjects.length / 6) * 18,
    };
    onChange([...roomObjects, obj]);
  }

  function handleAddCustom(e: React.FormEvent) {
    e.preventDefault();
    const name = customName.trim();
    if (!name) return;
    addObject("egen", name);
    setCustomName("");
  }

  return (
    <div className="grid gap-4 md:grid-cols-[200px_1fr]">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Legg til gjenstand</p>
        {PALETTE.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addObject(type, LABELS[type])}
            className="flex items-center gap-2 rounded-button border border-line px-3 py-2 text-sm text-foreground/80 hover:border-primary hover:text-primary"
          >
            <span className="h-5 w-5">
              <RoomIcon type={type} />
            </span>
            {LABELS[type]}
          </button>
        ))}
        <form onSubmit={handleAddCustom} className="mt-2 flex flex-col gap-2">
          <Input
            placeholder="Egen gjenstand..."
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <Button type="submit" variant="secondary" size="sm">
            <Plus size={14} /> Legg til
          </Button>
        </form>
        <p className="mt-2 text-xs text-foreground/50">
          Dra gjenstandene dit de står i klasserommet. Dra i den lille prikken nederst til høyre for å endre
          størrelse — en tavle er som regel større enn et vindu.
        </p>
      </div>
      <Card>
        <RoomCanvas roomObjects={roomObjects} podLayout={[]} objectsEditable onObjectsChange={onChange} />
      </Card>
    </div>
  );
}
