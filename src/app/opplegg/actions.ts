"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

  const buffer = Buffer.from(await file.arrayBuffer());

  await prisma.lessonPlan.create({
    data: {
      title,
      description: description || null,
      grade: grade || null,
      subjectId,
      fileName: file.name,
      fileType: file.type || null,
      fileSize: file.size,
      fileData: buffer,
    },
  });

  revalidatePath("/opplegg");
  redirect("/opplegg");
}

export async function deleteLessonPlan(id: string) {
  await prisma.lessonPlan.delete({ where: { id } });
  revalidatePath("/opplegg");
}
