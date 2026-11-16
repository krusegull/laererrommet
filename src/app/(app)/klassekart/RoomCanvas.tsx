"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { LockEntry, Pod, PodSeats, RoomObject, StudentLite } from "@/lib/klassekart/types";
import { MAX_OBJ_DIM, MIN_OBJ_DIM, LABELS, LockIcon, RoomIcon, objectDimensions } from "./icons";
import styles from "./klassekart.module.css";

const ALIGN_THRESHOLD = 1.5;

/**
 * Sammenligner en posisjon under dragging mot andre gjenstander av samme
 * type (pulter mot pulter, gjenstander mot gjenstander) og snapper til
 * samme x/y hvis noe er nær nok - samme idé som "smarte guider" i
 * PowerPoint/Figma. Returnerer (eventuelt snappet) posisjon pluss hvilken
 * hjelpelinje som skal vises.
 */
function computeAlignment(x: number, y: number, others: { x: number; y: number }[]) {
  let guideX: number | null = null;
  let guideY: number | null = null;
  let snappedX = x;
  let snappedY = y;
  for (const o of others) {
    if (guideX === null && Math.abs(o.x - x) < ALIGN_THRESHOLD) {
      guideX = o.x;
      snappedX = o.x;
    }
    if (guideY === null && Math.abs(o.y - y) < ALIGN_THRESHOLD) {
      guideY = o.y;
      snappedY = o.y;
    }
  }
  return { x: snappedX, y: snappedY, guideX, guideY };
}

interface RoomCanvasProps {
  roomObjects: RoomObject[];
  podLayout: Pod[];
  objectsEditable?: boolean;
  podsEditable?: boolean;
  seatedPods?: PodSeats | null;
  students?: StudentLite[];
  locks?: LockEntry[];
  seatsClickable?: boolean;
  locksEnabled?: boolean;
  selectedSeat?: { pod: number; seat: number } | null;
  onObjectsChange?: (next: RoomObject[]) => void;
  onPodLayoutChange?: (next: Pod[], regenerate: boolean) => void;
  onSeatClick?: (podIndex: number, seatIndex: number) => void;
  onToggleLock?: (podIndex: number, seatIndex: number) => void;
}

export function RoomCanvas({
  roomObjects,
  podLayout,
  objectsEditable = false,
  podsEditable = false,
  seatedPods = null,
  students = [],
  locks = [],
  seatsClickable = false,
  locksEnabled = false,
  selectedSeat = null,
  onObjectsChange,
  onPodLayoutChange,
  onSeatClick,
  onToggleLock,
}: RoomCanvasProps) {
  const roomRef = useRef<HTMLDivElement>(null);
  const studentById = new Map(students.map((s) => [s.id, s]));
  const [guides, setGuides] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

  function lockAt(podIndex: number, seatIndex: number) {
    return locks.find((l) => l.podIndex === podIndex && l.seatIndex === seatIndex);
  }

  function updateObject(id: string, patch: Partial<RoomObject>) {
    if (!onObjectsChange) return;
    onObjectsChange(roomObjects.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function alignObjectDrag(id: string, x: number, y: number) {
    const others = roomObjects.filter((o) => o.id !== id).map((o) => ({ x: o.x, y: o.y }));
    const result = computeAlignment(x, y, others);
    setGuides({ x: result.guideX, y: result.guideY });
    return result;
  }

  function alignPodDrag(id: number, x: number, y: number) {
    const others = podLayout.filter((p) => p.id !== id).map((p) => ({ x: p.x, y: p.y }));
    const result = computeAlignment(x, y, others);
    setGuides({ x: result.guideX, y: result.guideY });
    return result;
  }

  function removeObject(id: string) {
    if (!onObjectsChange) return;
    onObjectsChange(roomObjects.filter((o) => o.id !== id));
  }

  function updatePod(id: number, patch: Partial<Pod>, regenerate: boolean) {
    if (!onPodLayoutChange) return;
    onPodLayoutChange(podLayout.map((p) => (p.id === id ? { ...p, ...patch } : p)), regenerate);
  }

  function removePod(id: number) {
    if (!onPodLayoutChange) return;
    onPodLayoutChange(podLayout.filter((p) => p.id !== id), true);
  }

  return (
    <div ref={roomRef} className={styles.room}>
      {roomObjects.map((obj) => (
        <RoomObjectItem
          key={obj.id}
          obj={obj}
          roomRef={roomRef}
          editable={objectsEditable}
          onDragging={(x, y) => alignObjectDrag(obj.id, x, y)}
          onDragEnd={(x, y) => {
            updateObject(obj.id, { x, y });
            setGuides({ x: null, y: null });
          }}
          onResizeEnd={(w, h) => updateObject(obj.id, { w, h })}
          onLabelChange={(label) => updateObject(obj.id, { label })}
          onRemove={() => removeObject(obj.id)}
        />
      ))}
      {podLayout.map((pod, podIndex) => (
        <PodItem
          key={pod.id}
          pod={pod}
          podIndex={podIndex}
          roomRef={roomRef}
          editable={podsEditable}
          seats={seatedPods ? seatedPods[podIndex] ?? [] : null}
          studentById={studentById}
          seatsClickable={seatsClickable}
          locksEnabled={locksEnabled}
          lockAt={lockAt}
          selectedSeat={selectedSeat}
          onDragging={(x, y) => alignPodDrag(pod.id, x, y)}
          onDragEnd={(x, y) => {
            updatePod(pod.id, { x, y }, false);
            setGuides({ x: null, y: null });
          }}
          onSizeChange={(size) => updatePod(pod.id, { size }, true)}
          onRemove={() => removePod(pod.id)}
          onSeatClick={(seatIndex) => onSeatClick?.(podIndex, seatIndex)}
          onToggleLock={(seatIndex) => onToggleLock?.(podIndex, seatIndex)}
        />
      ))}
      {guides.x !== null && <div className={styles.guideV} style={{ left: guides.x + "%" }} />}
      {guides.y !== null && <div className={styles.guideH} style={{ top: guides.y + "%" }} />}
    </div>
  );
}

function RoomObjectItem({
  obj,
  roomRef,
  editable,
  onDragging,
  onDragEnd,
  onResizeEnd,
  onLabelChange,
  onRemove,
}: {
  obj: RoomObject;
  roomRef: React.RefObject<HTMLDivElement | null>;
  editable: boolean;
  onDragging: (x: number, y: number) => { x: number; y: number };
  onDragEnd: (x: number, y: number) => void;
  onResizeEnd: (w: number, h: number) => void;
  onLabelChange: (label: string) => void;
  onRemove: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const { w, h } = objectDimensions(obj);

  function handleDragStart(e: React.PointerEvent) {
    if (!editable) return;
    e.preventDefault();
    const wrap = wrapRef.current;
    const room = roomRef.current;
    if (!wrap || !room) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    wrap.classList.add(styles.dragging);
    let lastX = obj.x;
    let lastY = obj.y;

    function onMove(ev: PointerEvent) {
      const rect = room!.getBoundingClientRect();
      const rawX = Math.max(2, Math.min(98, ((ev.clientX - rect.left) / rect.width) * 100));
      const rawY = Math.max(2, Math.min(98, ((ev.clientY - rect.top) / rect.height) * 100));
      const { x, y } = onDragging(rawX, rawY);
      lastX = x;
      lastY = y;
      if (wrap) {
        wrap.style.left = x + "%";
        wrap.style.top = y + "%";
      }
    }
    function onUp(ev: PointerEvent) {
      (ev.target as HTMLElement).releasePointerCapture(ev.pointerId);
      wrap?.classList.remove(styles.dragging);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      onDragEnd(lastX, lastY);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleResizeStart(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const shape = shapeRef.current;
    if (!shape) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const startW = w;
    const startH = h;
    const startX = e.clientX;
    const startY = e.clientY;
    let lastW = startW;
    let lastH = startH;

    function onMove(ev: PointerEvent) {
      const nextW = Math.max(MIN_OBJ_DIM, Math.min(MAX_OBJ_DIM, startW + (ev.clientX - startX)));
      const nextH = Math.max(MIN_OBJ_DIM, Math.min(MAX_OBJ_DIM, startH + (ev.clientY - startY)));
      lastW = nextW;
      lastH = nextH;
      if (shape) {
        shape.style.width = nextW + "px";
        shape.style.height = nextH + "px";
      }
    }
    function onUp(ev: PointerEvent) {
      (ev.target as HTMLElement).releasePointerCapture(ev.pointerId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      onResizeEnd(Math.round(lastW), Math.round(lastH));
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div
      ref={wrapRef}
      className={styles.roomObj}
      style={{ left: obj.x + "%", top: obj.y + "%" }}
    >
      <div
        ref={shapeRef}
        className={cn(styles.shape, editable && styles.shapeEditable)}
        style={{ width: w, height: h }}
        onPointerDown={handleDragStart}
        aria-hidden="true"
      >
        <div className={styles.shapeIcon} style={{ width: Math.min(w, h) * 0.6, height: Math.min(w, h) * 0.6 }}>
          <RoomIcon type={obj.type} />
        </div>
        {editable && <div className={styles.resizeHandle} onPointerDown={handleResizeStart} />}
      </div>
      {editable ? (
        <span
          className={cn(styles.objLabel, styles.objLabelEditable)}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onBlur={(e) => onLabelChange(e.currentTarget.textContent?.trim() || LABELS[obj.type])}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {obj.label}
        </span>
      ) : (
        <span className={styles.objLabel}>{obj.label}</span>
      )}
      {editable && (
        <button
          type="button"
          className={styles.removeBtn}
          aria-label={"Fjern " + obj.label}
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </div>
  );
}

function PodItem({
  pod,
  podIndex,
  roomRef,
  editable,
  seats,
  studentById,
  seatsClickable,
  locksEnabled,
  lockAt,
  selectedSeat,
  onDragging,
  onDragEnd,
  onSizeChange,
  onRemove,
  onSeatClick,
  onToggleLock,
}: {
  pod: Pod;
  podIndex: number;
  roomRef: React.RefObject<HTMLDivElement | null>;
  editable: boolean;
  seats: (string | null)[] | null;
  studentById: Map<string, StudentLite>;
  seatsClickable: boolean;
  locksEnabled: boolean;
  lockAt: (podIndex: number, seatIndex: number) => LockEntry | undefined;
  selectedSeat: { pod: number; seat: number } | null;
  onDragging: (x: number, y: number) => { x: number; y: number };
  onDragEnd: (x: number, y: number) => void;
  onSizeChange: (size: number) => void;
  onRemove: () => void;
  onSeatClick: (seatIndex: number) => void;
  onToggleLock: (seatIndex: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  function handleDragStart(e: React.PointerEvent) {
    if (!editable) return;
    if ((e.target as HTMLElement).closest(`.${styles.podControls}`)) return;
    e.preventDefault();
    const wrap = wrapRef.current;
    const room = roomRef.current;
    if (!wrap || !room) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    wrap.classList.add(styles.podDragging);
    let lastX = pod.x;
    let lastY = pod.y;

    function onMove(ev: PointerEvent) {
      const rect = room!.getBoundingClientRect();
      const rawX = Math.max(4, Math.min(96, ((ev.clientX - rect.left) / rect.width) * 100));
      const rawY = Math.max(4, Math.min(96, ((ev.clientY - rect.top) / rect.height) * 100));
      const { x, y } = onDragging(rawX, rawY);
      lastX = x;
      lastY = y;
      if (wrap) {
        wrap.style.left = x + "%";
        wrap.style.top = y + "%";
      }
    }
    function onUp(ev: PointerEvent) {
      (ev.target as HTMLElement).releasePointerCapture(ev.pointerId);
      wrap?.classList.remove(styles.podDragging);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      onDragEnd(lastX, lastY);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const deskSlots = seats ?? new Array(pod.size).fill(null);

  return (
    <div
      ref={wrapRef}
      className={cn(styles.pod, editable && styles.podEditable)}
      style={{ left: pod.x + "%", top: pod.y + "%" }}
      onPointerDown={handleDragStart}
    >
      {deskSlots.map((studentId, seatIndex) => {
        const student = studentId ? studentById.get(studentId) : null;
        const locked = lockAt(podIndex, seatIndex);
        const isSelected = selectedSeat?.pod === podIndex && selectedSeat?.seat === seatIndex;
        const clickable = seatsClickable && Boolean(student);
        return (
          <div
            key={seatIndex}
            className={cn(
              styles.desk,
              student && (student.gender === "gutt" ? styles.deskBoy : styles.deskGirl),
              clickable && styles.deskSeat,
              isSelected && styles.deskSelected,
              locked && styles.deskLocked
            )}
            onClick={clickable ? () => onSeatClick(seatIndex) : undefined}
          >
            {student ? student.name : ""}
            {locksEnabled && student && (
              <button
                type="button"
                className={styles.lockBtn}
                aria-label={"Lås/lås opp plassen til " + student.name}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock(seatIndex);
                }}
              >
                <LockIcon />
              </button>
            )}
          </div>
        );
      })}
      {editable && (
        <div className={styles.podControls}>
          <button
            type="button"
            aria-label="Færre pulter i gruppen"
            onClick={() => onSizeChange(Math.max(1, pod.size - 1))}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Flere pulter i gruppen"
            onClick={() => onSizeChange(Math.min(6, pod.size + 1))}
          >
            +
          </button>
          <button type="button" className={styles.podRemoveBtn} aria-label="Fjern gruppen" onClick={onRemove}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
