"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Pod, PodSeats, RoomObject, StudentLite } from "@/lib/klassekart/types";
import styles from "./klassekart.module.css";

const LANDMARK_TYPES: RoomObject["type"][] = ["dor", "tavle", "vindu"];

function nearestLandmark(pod: Pod, roomObjects: RoomObject[]): string | null {
  const landmarks = roomObjects.filter((o) => LANDMARK_TYPES.includes(o.type));
  if (landmarks.length === 0) return null;
  let best = landmarks[0];
  let bestDist = Infinity;
  for (const obj of landmarks) {
    const dist = (obj.x - pod.x) ** 2 + (obj.y - pod.y) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = obj;
    }
  }
  return best.label;
}

export function ShareOverlay({
  open,
  onClose,
  roomObjects,
  podLayout,
  pods,
  students,
}: {
  open: boolean;
  onClose: () => void;
  roomObjects: RoomObject[];
  podLayout: Pod[];
  pods: PodSeats;
  students: StudentLite[];
}) {
  const [index, setIndex] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setIndex(0);
  }

  const studentById = new Map(students.map((s) => [s.id, s]));

  const flat = podLayout.flatMap((pod, podIndex) =>
    (pods[podIndex] ?? []).map((studentId, seatIndex) => ({ pod, podIndex, seatIndex, studentId }))
      .filter((entry) => entry.studentId)
  );

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(flat.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, flat.length]);

  if (!open) return null;

  if (flat.length === 0) {
    return (
      <div className={styles.shareOverlay}>
        <button type="button" className={styles.presentClose} aria-label="Lukk" onClick={onClose}>
          <X size={18} />
        </button>
        <p className={styles.shareWith}>Generer et klassekart først, så kan du dele det med elevene.</p>
      </div>
    );
  }

  const entry = flat[index];
  const student = studentById.get(entry.studentId as string);
  const deskmates = (pods[entry.podIndex] ?? [])
    .filter((id) => id && id !== entry.studentId)
    .map((id) => studentById.get(id as string)?.name)
    .filter(Boolean);
  const location = nearestLandmark(entry.pod, roomObjects);

  return (
    <div className={styles.shareOverlay}>
      <button type="button" className={styles.presentClose} aria-label="Lukk" onClick={onClose}>
        <X size={18} />
      </button>
      <div className={styles.shareCard}>
        <p className={styles.shareWith}>Din plass</p>
        <h2 className={styles.shareName}>{student?.name ?? "?"}</h2>
        <p className={styles.shareWith}>
          {deskmates.length > 0 ? "Du sitter med " + deskmates.join(" og ") : "Du sitter alene i denne gruppen"}
        </p>
        {location && <p className={styles.shareLocation}>Nærmest: {location}</p>}
      </div>
      <div className={styles.shareNav}>
        <Button variant="ghost" size="sm" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          <ChevronLeft size={16} /> Forrige
        </Button>
        <span className={styles.shareProgress}>
          {index + 1} / {flat.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIndex((i) => Math.min(flat.length - 1, i + 1))}
          disabled={index === flat.length - 1}
        >
          Neste <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
