"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UPLOAD_DIR } from "@/lib/uploads";

export async function createSubject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Fagnavn er påkrevd");

  await prisma.subject.upsert({
    where: { name },
    update: {},
    create: { name },
  });

  revalidatePath("/opplegg");
}

export async function uploadLessonPlan(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const subjectId = String(formData.get("subjectId") ?? "").trim();
  const file = formData.get("file");

  if (!title || !subjectId) {
    throw new Error("Tittel og fag er påkrevd");
  }
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Du må velge en fil");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storedName = `${randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  await prisma.lessonPlan.create({
    data: {
      title,
      description: description || null,
      grade: grade || null,
      subjectId,
      fileName: file.name,
      filePath: storedName,
      fileType: file.type || null,
      fileSize: file.size,
    },
  });

  revalidatePath("/opplegg");
  redirect("/opplegg");
}

export async function deleteLessonPlan(id: string) {
  const plan = await prisma.lessonPlan.findUnique({ where: { id } });
  if (!plan) return;

  await prisma.lessonPlan.delete({ where: { id } });
  try {
    await unlink(path.join(UPLOAD_DIR, plan.filePath));
  } catch {
    // filen kan allerede være borte fra disk, ignorer
  }

  revalidatePath("/opplegg");
}
