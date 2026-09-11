"use client";

import { X, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { PRIORITY_STYLES, detectPriority } from "./noteUtils";

export interface NoteRowItem {
  id: string;
  content: string;
  priority: number | null;
  completed: boolean;
  dismissed: boolean;
}

export function NoteRow({
  item,
  onToggleCompleted,
  onDismissPriority,
  onRestorePriority,
  onDelete,
}: {
  item: NoteRowItem;
  onToggleCompleted: () => void;
  onDismissPriority: () => void;
  onRestorePriority: () => void;
  onDelete: () => void;
}) {
  const detected = item.dismissed ? null : item.priority;
  const style = detected ? PRIORITY_STYLES[detected] : null;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-button border-l-4 bg-background-subtle/40 px-2.5 py-1.5",
        style ? style.border : "border-l-transparent",
        item.completed && "opacity-50"
      )}
    >
      <input
        type="checkbox"
        checked={item.completed}
        onChange={onToggleCompleted}
        aria-label={`Merk "${item.content}" som gjennomført`}
        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
      />
      <span
        className={cn(
          "flex-1 whitespace-pre-wrap break-words text-sm text-foreground",
          item.completed && "line-through"
        )}
      >
        {item.content}
      </span>
      {style && (
        <button
          type="button"
          onClick={onDismissPriority}
          aria-label="Ikke prioritet, bare tekst"
          title={style.label}
          className="mt-0.5 flex shrink-0 items-center gap-1 text-foreground/30 hover:text-error"
        >
          <span className={cn("h-2 w-2 rounded-full", style.dot)} />
          <X size={12} />
        </button>
      )}
      {!style && detectPriority(item.content) !== null && item.dismissed && (
        <button
          type="button"
          onClick={onRestorePriority}
          className="mt-0.5 shrink-0 text-xs text-foreground/40 hover:text-primary"
        >
          Bruk som prioritet
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Slett "${item.content}"`}
        className="mt-0.5 shrink-0 text-foreground/30 hover:text-error"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
