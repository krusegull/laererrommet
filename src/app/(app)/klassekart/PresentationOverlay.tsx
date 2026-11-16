"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { Pod, PodSeats, RoomObject, StudentLite } from "@/lib/klassekart/types";
import { RoomIcon, objectDimensions } from "./icons";
import styles from "./klassekart.module.css";

const PRESENT_COLORS = ["#7b6ef2", "#ff6f9c", "#2fc6a0", "#ffb347", "#4fa6ff"];

export function PresentationOverlay({
  open,
  onClose,
  className,
  roomObjects,
  podLayout,
  pods,
  students,
}: {
  open: boolean;
  onClose: () => void;
  className: string;
  roomObjects: RoomObject[];
  podLayout: Pod[];
  pods: PodSeats;
  students: StudentLite[];
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const studentById = new Map(students.map((s) => [s.id, s]));

  type Item =
    | { kind: "furniture"; x: number; y: number; obj: RoomObject }
    | { kind: "pod"; x: number; y: number; pod: Pod; podIndex: number };

  const ordered: Item[] = [
    ...roomObjects.map((obj): Item => ({ kind: "furniture", x: obj.x, y: obj.y, obj })),
    ...podLayout.map((pod, podIndex): Item => ({ kind: "pod", x: pod.x, y: pod.y, pod, podIndex })),
  ].sort((a, b) => a.y - b.y || a.x - b.x);

  const items: (Item & { delay: number })[] = [];
  for (let i = 0, acc = 0; i < ordered.length; i++) {
    items.push({ ...ordered[i], delay: acc });
    acc += ordered[i].kind === "furniture" ? 60 : 90;
  }

  return (
    <div className={styles.presentOverlay}>
      <button type="button" className={styles.presentClose} aria-label="Lukk" onClick={onClose}>
        <X size={18} />
      </button>
      <div className={styles.presentInner}>
        <p className={styles.presentEyebrow}>Klassekart</p>
        <h1 className={styles.presentTitle}>{className}</h1>
        <div className={styles.presentRoom}>
          {items.map((item, i) => {
            const itemDelay = item.delay;
            if (item.kind === "furniture") {
              const dims = objectDimensions(item.obj);
              // Ikonet vises alltid udistorsert (kvadratisk) her - selve
              // formen er mindre viktig enn i Rom-fanen. Størrelsen følger
              // likevel gjenstandens reelle "bigness" (geometrisk snitt av
              // bredde/høyde), så en tavle fortsatt synes tydelig større.
              const presentSz = Math.max(26, Math.min(130, Math.round(Math.sqrt(dims.w * dims.h) * 1.3)));
              return (
                <div key={"f" + i} className={styles.presentLandmark} style={{ animationDelay: itemDelay + "ms" }}>
                  <div className={styles.presentLandmarkIcon} style={{ width: presentSz, height: presentSz }}>
                    <RoomIcon type={item.obj.type} />
                  </div>
                  <div className={styles.presentLandmarkLabel}>{item.obj.label}</div>
                </div>
              );
            }
            const color = PRESENT_COLORS[item.podIndex % PRESENT_COLORS.length];
            const seats = pods[item.podIndex] ?? [];
            return (
              <div key={"p" + i} className={styles.presentPod} style={{ animationDelay: itemDelay + "ms" }}>
                {Array.from({ length: item.pod.size }).map((_, seatIndex) => {
                  const student = seats[seatIndex] ? studentById.get(seats[seatIndex] as string) : null;
                  return (
                    <div key={seatIndex} className={styles.presentDesk} style={{ background: color }}>
                      {student ? student.name : "–"}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <p className={styles.presentHint}>Trykk Esc for å lukke</p>
      </div>
    </div>
  );
}
