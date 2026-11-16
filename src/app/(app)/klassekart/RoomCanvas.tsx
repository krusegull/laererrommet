"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import type { LockEntry, Pod, PodSeats, RoomObject, StudentLite } from "@/lib/klassekart/types";
import { MAX_OBJ_SIZE, MIN_OBJ_SIZE, LABELS, LockIcon, RoomIcon, objectSize } from "./icons";
import styles from "./klassekart.module.css";

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

  function lockAt(podIndex: number, seatIndex: number) {
    return locks.find((l) => l.podIndex === podIndex && l.seatIndex === seatIndex);
  }

  function updateObject(id: string, patch: Partial<RoomObject>) {
    if (!onObjectsChange) return;
    onObjectsChange(roomObjects.map((o) => (o.id === id ? { ...o, ...patch } : o)));
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
          onDragEnd={(x, y) => updateObject(obj.id, { x, y })}
          onResizeEnd={(size) => updateObject(obj.id, { size })}
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
          onDragEnd={(x, y) => updatePod(pod.id, { x, y }, false)}
          onSizeChange={(size) => updatePod(pod.id, { size }, true)}
          onRemove={() => removePod(pod.id)}
          onSeatClick={(seatIndex) => onSeatClick?.(podIndex, seatIndex)}
          onToggleLock={(seatIndex) => onToggleLock?.(podIndex, seatIndex)}
        />
      ))}
    </div>
  );
}

function RoomObjectItem({
  obj,
  roomRef,
  editable,
  onDragEnd,
  onResizeEnd,
  onLabelChange,
  onRemove,
}: {
  obj: RoomObject;
  roomRef: React.RefObject<HTMLDivElement | null>;
  editable: boolean;
  onDragEnd: (x: number, y: number) => void;
  onResizeEnd: (size: number) => void;
  onLabelChange: (label: string) => void;
  onRemove: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);
  const size = objectSize(obj);

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
      const x = Math.max(2, Math.min(98, ((ev.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(2, Math.min(98, ((ev.clientY - rect.top) / rect.height) * 100));
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
    const startSize = size;
    const startX = e.clientX;
    const startY = e.clientY;
    let lastSize = startSize;

    function onMove(ev: PointerEvent) {
      const delta = Math.max(ev.clientX - startX, ev.clientY - startY);
      const next = Math.max(MIN_OBJ_SIZE, Math.min(MAX_OBJ_SIZE, startSize + delta));
      lastSize = next;
      if (shape) {
        shape.style.width = next + "px";
        shape.style.height = next + "px";
      }
    }
    function onUp(ev: PointerEvent) {
      (ev.target as HTMLElement).releasePointerCapture(ev.pointerId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      onResizeEnd(Math.round(lastSize));
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
        style={{ width: size, height: size }}
        onPointerDown={handleDragStart}
        aria-hidden="true"
      >
        <RoomIcon type={obj.type} />
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
      const x = Math.max(4, Math.min(96, ((ev.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(4, Math.min(96, ((ev.clientY - rect.top) / rect.height) * 100));
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
