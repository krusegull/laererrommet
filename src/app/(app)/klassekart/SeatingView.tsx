"use client";

import { useState } from "react";
import { AlertTriangle, Eye, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { LockEntry, Pod, PodSeats, RoomObject, StudentLite } from "@/lib/klassekart/types";
import { RoomCanvas } from "./RoomCanvas";
import styles from "./klassekart.module.css";

interface PendingSwap {
  p1: number;
  s1: number;
  p2: number;
  s2: number;
  names: string[];
}

export function SeatingView({
  roomObjects,
  podLayout,
  pods,
  locks,
  students,
  updatedAt,
  onGenerate,
  onToggleLock,
  onSwap,
  onOpenPresent,
  onOpenShare,
}: {
  roomObjects: RoomObject[];
  podLayout: Pod[];
  pods: PodSeats;
  locks: LockEntry[];
  students: StudentLite[];
  updatedAt: string | null;
  onGenerate: () => Promise<void>;
  onToggleLock: (podIndex: number, seatIndex: number) => Promise<void>;
  onSwap: (p1: number, s1: number, p2: number, s2: number, force?: boolean) => Promise<
    { ok: true } | { ok: false; locked: { id: string; name: string }[] }
  >;
  onOpenPresent: () => void;
  onOpenShare: () => void;
}) {
  const [selected, setSelected] = useState<{ pod: number; seat: number } | null>(null);
  const [pendingSwap, setPendingSwap] = useState<PendingSwap | null>(null);
  const [generating, setGenerating] = useState(false);

  const hasSeating = pods.some((seats) => seats.some((id) => id));

  async function handleGenerate() {
    setGenerating(true);
    try {
      await onGenerate();
    } finally {
      setGenerating(false);
    }
  }

  async function handleSeatClick(podIndex: number, seatIndex: number) {
    if (!selected) {
      setSelected({ pod: podIndex, seat: seatIndex });
      return;
    }
    if (selected.pod === podIndex && selected.seat === seatIndex) {
      setSelected(null);
      return;
    }
    const { pod: p1, seat: s1 } = selected;
    setSelected(null);
    const result = await onSwap(p1, s1, podIndex, seatIndex);
    if (!result.ok) {
      setPendingSwap({ p1, s1, p2: podIndex, s2: seatIndex, names: result.locked.map((l) => l.name) });
    }
  }

  async function confirmForcedSwap() {
    if (!pendingSwap) return;
    await onSwap(pendingSwap.p1, pendingSwap.s1, pendingSwap.p2, pendingSwap.s2, true);
    setPendingSwap(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-foreground/60">
          {updatedAt ? "Sist generert: " + new Date(updatedAt).toLocaleString("nb-NO") : "Ikke generert ennå"}
        </p>
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={handleGenerate} loading={generating}>
            <RefreshCw size={14} /> Generer nytt kart
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onOpenPresent} disabled={!hasSeating}>
            <Eye size={14} /> Vis til elevene
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onOpenShare} disabled={!hasSeating}>
            <Users size={14} /> Del med én elev
          </Button>
        </div>
      </div>

      {pendingSwap && (
        <div className={styles.lockWarning}>
          <AlertTriangle size={16} />
          <span>{pendingSwap.names.join(" og ")} er låst til sin plass. Flytte likevel?</span>
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setPendingSwap(null)}>
              Avbryt
            </Button>
            <Button type="button" size="sm" onClick={confirmForcedSwap}>
              Flytt likevel
            </Button>
          </div>
        </div>
      )}

      <Card>
        <RoomCanvas
          roomObjects={roomObjects}
          podLayout={podLayout}
          seatedPods={pods}
          students={students}
          seatsClickable
          locksEnabled
          locks={locks}
          selectedSeat={selected}
          onSeatClick={(podIndex, seatIndex) => handleSeatClick(podIndex, seatIndex)}
          onToggleLock={(podIndex, seatIndex) => onToggleLock(podIndex, seatIndex)}
        />
      </Card>
      <div className={styles.legend}>
        <span>
          <span className={styles.legendDot} style={{ background: "#2f6fb3" }} /> Gutt
        </span>
        <span>
          <span className={styles.legendDot} style={{ background: "#c23e78" }} /> Jente
        </span>
        <span>Klikk to pulter for å bytte plass manuelt</span>
        <span>Klikk hengelås-ikonet for å låse en elev fast til plassen (f.eks. ved behov for syn/hørsel)</span>
      </div>
    </div>
  );
}
