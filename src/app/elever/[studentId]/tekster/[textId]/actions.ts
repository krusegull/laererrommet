"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { FeedbackCategory } from "@/lib/feedback";

export async function createAnnotation({
  studentId,
  textId,
  startOffset,
  endOffset,
  quote,
  comment,
  category,
}: {
  studentId: string;
  textId: string;
  startOffset: number;
  endOffset: number;
  quote: string;
  comment: string;
  category: FeedbackCategory;
}) {
  if (startOffset < 0 || endOffset <= startOffset) {
    throw new Error("Ugyldig tekstutvalg");
  }
  if (!comment.trim()) {
    throw new Error("Kommentar er påkrevd");
  }

  const existing = await prisma.annotation.findMany({
    where: { textId },
    select: { startOffset: true, endOffset: true },
  });
  const overlaps = existing.some(
    (a) => startOffset < a.endOffset && endOffset > a.startOffset
  );
  if (overlaps) {
    throw new Error("Utvalget overlapper med en eksisterende kommentar");
  }

  const annotation = await prisma.annotation.create({
    data: { textId, startOffset, endOffset, quote, comment: comment.trim(), category },
  });

  revalidatePath(`/elever/${studentId}/tekster/${textId}`);
  revalidatePath(`/elever/${studentId}`);
  return annotation;
}

export async function deleteAnnotation({
  studentId,
  textId,
  annotationId,
}: {
  studentId: string;
  textId: string;
  annotationId: string;
}) {
  await prisma.annotation.delete({ where: { id: annotationId } });
  revalidatePath(`/elever/${studentId}/tekster/${textId}`);
  revalidatePath(`/elever/${studentId}`);
}
