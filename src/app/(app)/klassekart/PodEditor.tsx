"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Pod, RoomObject, StudentLite } from "@/lib/klassekart/types";
import { RoomCanvas } from "./RoomCanvas";

export function PodEditor({
  roomObjects,
  podLayout,
  students,
  onPodLayoutChange,
}: {
  roomObjects: RoomObject[];
  podLayout: Pod[];
  students: StudentLite[];
  onPodLayoutChange: (next: Pod[], regenerate: boolean) => void;
}) {
  const seatCount = podLayout.reduce((sum, p) => sum + p.size, 0);
  const mismatch = seatCount !== students.length;

  function addPod() {
    const nextId = podLayout.length > 0 ? Math.max(...podLayout.map((p) => p.id)) + 1 : 1;
    const offset = podLayout.length % 4;
    onPodLayoutChange(
      [...podLayout, { id: nextId, size: 2, x: 25 + offset * 17, y: 25 + Math.floor(podLayout.length / 4) * 25 }],
      true
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {mismatch ? (
          <p className="rounded-button border border-error/30 bg-error/10 px-3 py-1.5 text-sm text-error">
            {seatCount} seter, {students.length} elever — tallene stemmer ikke.
          </p>
        ) : (
          <p className="text-sm text-foreground/60">{seatCount} seter til {students.length} elever. Stemmer!</p>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={addPod}>
          <Plus size={14} /> Ny gruppe
        </Button>
      </div>
      <Card>
        <RoomCanvas
          roomObjects={roomObjects}
          podLayout={podLayout}
          podsEditable
          onPodLayoutChange={onPodLayoutChange}
        />
      </Card>
      <p className="text-xs text-foreground/50">
        Dra pultgruppene dit de står i rommet. Bruk +/− for å endre hvor mange som sitter sammen i hver gruppe —
        pultene innad i en gruppe ligger alltid helt ved siden av hverandre.
      </p>
    </div>
  );
}
