"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { CATEGORY_META, type FeedbackCategory } from "@/lib/feedback";
import { createAnnotation, deleteAnnotation } from "./actions";

type Annotation = {
  id: string;
  startOffset: number;
  endOffset: number;
  quote: string;
  comment: string;
  category: FeedbackCategory;
};

type PendingSelection = {
  startOffset: number;
  endOffset: number;
  quote: string;
  top: number;
  left: number;
};

export function AnnotationEditor({
  studentId,
  textId,
  content,
  initialAnnotations,
}: {
  studentId: string;
  textId: string;
  content: string;
  initialAnnotations: Annotation[];
}) {
  const [annotations, setAnnotations] = useState<Annotation[]>(
    [...initialAnnotations].sort((a, b) => a.startOffset - b.startOffset)
  );
  const [pending, setPending] = useState<PendingSelection | null>(null);
  const [category, setCategory] = useState<FeedbackCategory>("STYRKE");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  const segments = useMemo(() => buildSegments(content, annotations), [content, annotations]);

  function handleMouseUp() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) return;
    const range = selection.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) return;

    const startOffset = getTextOffset(containerRef.current, range.startContainer, range.startOffset);
    const endOffset = getTextOffset(containerRef.current, range.endContainer, range.endOffset);
    if (endOffset <= startOffset) return;

    const quote = content.slice(startOffset, endOffset);
    const overlaps = annotations.some(
      (a) => startOffset < a.endOffset && endOffset > a.startOffset
    );
    if (overlaps) {
      setError("Utvalget overlapper med en eksisterende kommentar. Slett den først.");
      selection.removeAllRanges();
      return;
    }

    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const popoverWidth = 320;
    const maxLeft = containerRect.width - popoverWidth;
    setActiveAnnotationId(null);
    setError(null);
    setComment("");
    setCategory("STYRKE");
    setPending({
      startOffset,
      endOffset,
      quote,
      top: rect.bottom - containerRect.top + 8,
      left: Math.max(0, Math.min(rect.left - containerRect.left, Math.max(0, maxLeft))),
    });
  }

  function closePending() {
    setPending(null);
    setComment("");
    setError(null);
    window.getSelection()?.removeAllRanges();
  }

  function handleSave() {
    if (!pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const annotation = await createAnnotation({
          studentId,
          textId,
          startOffset: pending.startOffset,
          endOffset: pending.endOffset,
          quote: pending.quote,
          comment,
          category,
        });
        setAnnotations((prev) =>
          [...prev, annotation as Annotation].sort((a, b) => a.startOffset - b.startOffset)
        );
        closePending();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Noe gikk galt");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAnnotation({ studentId, textId, annotationId: id });
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
      setActiveAnnotationId(null);
    });
  }

  return (
    <div>
      <p className="mb-2 text-sm text-slate-500">
        Marker et utdrag av teksten med musa for å legge til en tilbakemelding.
      </p>
      <div className="relative">
        <div
          ref={containerRef}
          onMouseUp={handleMouseUp}
          className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-5 text-slate-800 leading-relaxed select-text"
        >
          {segments.map((segment, i) =>
            segment.annotation ? (
              <mark
                key={i}
                onClick={() => setActiveAnnotationId(segment.annotation!.id)}
                className={`cursor-pointer rounded px-0.5 underline decoration-2 underline-offset-2 ${
                  CATEGORY_META[segment.annotation.category].highlight
                }`}
              >
                {segment.text}
              </mark>
            ) : (
              <span key={i}>{segment.text}</span>
            )
          )}
        </div>

        {pending && (
          <div
            className="absolute z-20 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
            style={{ top: pending.top, left: pending.left }}
          >

          <p className="mb-2 line-clamp-2 text-xs italic text-slate-500">
            &ldquo;{pending.quote}&rdquo;
          </p>
          <div className="mb-2 flex gap-2">
            {(Object.keys(CATEGORY_META) as FeedbackCategory[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  category === key
                    ? `${CATEGORY_META[key].bg} ${CATEGORY_META[key].text} ring-1 ring-inset ring-current`
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {CATEGORY_META[key].label}
              </button>
            ))}
          </div>
          <textarea
            autoFocus
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Skriv tilbakemeldingen din..."
            className="mb-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closePending}
              className="rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
            >
              Avbryt
            </button>
            <button
              type="button"
              disabled={isPending || !comment.trim()}
              onClick={handleSave}
              className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              Lagre
            </button>
          </div>
          </div>
        )}
      </div>

      {activeAnnotationId && (
        <ActiveAnnotationPopover
          annotation={annotations.find((a) => a.id === activeAnnotationId)!}
          onClose={() => setActiveAnnotationId(null)}
          onDelete={() => handleDelete(activeAnnotationId)}
          isPending={isPending}
        />
      )}

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Alle kommentarer ({annotations.length})
        </h2>
        {annotations.length === 0 ? (
          <p className="text-sm text-slate-500">Ingen kommentarer lagt til ennå.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {annotations.map((a) => (
              <li
                key={a.id}
                className={`rounded-lg border p-3 text-sm ${CATEGORY_META[a.category].border} ${CATEGORY_META[a.category].bg}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_META[a.category].text}`}
                    >
                      {CATEGORY_META[a.category].label}
                    </span>
                    <span className="italic text-slate-500">&ldquo;{a.quote}&rdquo;</span>
                    <p className="mt-1 text-slate-700">{a.comment}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    disabled={isPending}
                    className="shrink-0 text-xs text-slate-400 hover:text-red-600"
                  >
                    Slett
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ActiveAnnotationPopover({
  annotation,
  onClose,
  onDelete,
  isPending,
}: {
  annotation: Annotation;
  onClose: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/20 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className={`mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_META[annotation.category].text} ${CATEGORY_META[annotation.category].bg}`}
        >
          {CATEGORY_META[annotation.category].label}
        </span>
        <p className="mb-1 italic text-slate-500">&ldquo;{annotation.quote}&rdquo;</p>
        <p className="mb-4 text-slate-800">{annotation.comment}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
          >
            Lukk
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onDelete}
            className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            Slett kommentar
          </button>
        </div>
      </div>
    </div>
  );
}

function buildSegments(content: string, annotations: Annotation[]) {
  const sorted = [...annotations].sort((a, b) => a.startOffset - b.startOffset);
  const segments: { text: string; annotation: Annotation | null }[] = [];
  let cursor = 0;
  for (const annotation of sorted) {
    if (annotation.startOffset > cursor) {
      segments.push({ text: content.slice(cursor, annotation.startOffset), annotation: null });
    }
    segments.push({
      text: content.slice(annotation.startOffset, annotation.endOffset),
      annotation,
    });
    cursor = annotation.endOffset;
  }
  if (cursor < content.length) {
    segments.push({ text: content.slice(cursor), annotation: null });
  }
  return segments;
}

function getTextOffset(container: Node, node: Node, offset: number): number {
  const range = document.createRange();
  range.selectNodeContents(container);
  range.setEnd(node, offset);
  return range.toString().length;
}
