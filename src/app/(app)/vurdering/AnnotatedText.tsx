"use client";

import { useRef, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { ElevTekstKommentar } from "@/lib/vurdering/types";

function offsetWithinContainer(container: Node, node: Node, nodeOffset: number): number {
  let offset = 0;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    if (current === node) return offset + nodeOffset;
    offset += current.textContent?.length ?? 0;
    current = walker.nextNode();
  }
  return offset;
}

interface Segment {
  text: string;
  comment?: ElevTekstKommentar;
}

function buildSegments(text: string, comments: ElevTekstKommentar[]): Segment[] {
  const sorted = [...comments].sort((a, b) => a.startOffset - b.startOffset);
  const segments: Segment[] = [];
  let cursor = 0;
  for (const c of sorted) {
    if (c.startOffset < cursor) continue;
    if (c.startOffset > cursor) segments.push({ text: text.slice(cursor, c.startOffset) });
    segments.push({ text: text.slice(c.startOffset, c.endOffset), comment: c });
    cursor = c.endOffset;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

export function AnnotatedText({
  text,
  comments,
  onAddComment,
  onDeleteComment,
}: {
  text: string;
  comments: ElevTekstKommentar[];
  onAddComment: (startOffset: number, endOffset: number, kommentar: string) => Promise<void>;
  onDeleteComment: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [draftComment, setDraftComment] = useState("");
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  function handleMouseUp() {
    const container = containerRef.current;
    const sel = window.getSelection();
    if (!container || !sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) return;

    const start = offsetWithinContainer(container, range.startContainer, range.startOffset);
    const end = offsetWithinContainer(container, range.endContainer, range.endOffset);
    if (start === end) return;

    const overlaps = comments.some((c) => start < c.endOffset && end > c.startOffset);
    setSelectionError(overlaps ? "Dette utvalget overlapper en eksisterende kommentar." : null);
    setSelection(overlaps ? null : { start: Math.min(start, end), end: Math.max(start, end) });
    setDraftComment("");
  }

  async function submitComment() {
    if (!selection || !draftComment.trim()) return;
    setSaving(true);
    try {
      await onAddComment(selection.start, selection.end, draftComment.trim());
      setSelection(null);
      setDraftComment("");
      window.getSelection()?.removeAllRanges();
    } finally {
      setSaving(false);
    }
  }

  const segments = buildSegments(text, comments);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-foreground/50">
        Merk et utsnitt av teksten under for å legge til en kommentar - akkurat som i Word.
      </p>
      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        data-testid="annotated-text"
        className="whitespace-pre-wrap rounded-button border border-line bg-background p-3 text-sm leading-relaxed text-foreground/80 select-text"
      >
        {segments.map((seg, i) =>
          seg.comment ? (
            <mark
              key={i}
              onClick={() => setActiveCommentId(seg.comment!.id === activeCommentId ? null : seg.comment!.id)}
              className={cn(
                "cursor-pointer rounded bg-primary/20 px-0.5 text-foreground",
                activeCommentId === seg.comment.id && "ring-2 ring-primary"
              )}
            >
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </div>

      {selectionError && <p className="text-sm text-error">{selectionError}</p>}

      {selection && (
        <div className="flex flex-col gap-2 rounded-button border border-primary/40 bg-primary/5 p-3">
          <p className="text-xs text-foreground/60">
            Kommentar til: «{text.slice(selection.start, selection.end).slice(0, 80)}
            {selection.end - selection.start > 80 ? "…" : ""}»
          </p>
          <textarea
            autoFocus
            value={draftComment}
            onChange={(e) => setDraftComment(e.target.value)}
            rows={2}
            placeholder="Skriv kommentaren..."
            className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={submitComment} loading={saving} disabled={!draftComment.trim()}>
              Legg til kommentar
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelection(null)}>
              Avbryt
            </Button>
          </div>
        </div>
      )}

      {comments.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Kommentarer i teksten ({comments.length})</p>
          {[...comments]
            .sort((a, b) => a.startOffset - b.startOffset)
            .map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveCommentId(c.id === activeCommentId ? null : c.id)}
                className={cn(
                  "flex cursor-pointer items-start justify-between gap-2 rounded-button border border-line p-2.5 text-sm",
                  activeCommentId === c.id && "border-primary"
                )}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    {c.kilde === "ki" && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <Sparkles size={11} /> KI-forslag
                      </span>
                    )}
                    <span className="text-xs text-foreground/50">
                      «{text.slice(c.startOffset, c.endOffset).slice(0, 50)}
                      {c.endOffset - c.startOffset > 50 ? "…" : ""}»
                    </span>
                  </div>
                  <p className="text-foreground/80">{c.kommentar}</p>
                </div>
                <button
                  type="button"
                  aria-label="Slett kommentaren"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteComment(c.id);
                  }}
                  className="shrink-0 text-foreground/30 hover:text-error"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
