"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createStudentText(studentId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) {
    throw new Error("Tittel og tekst er påkrevd");
  }

  const text = await prisma.studentText.create({
    data: { title, content, studentId },
  });

  revalidatePath(`/elever/${studentId}`);
  redirect(`/elever/${studentId}/tekster/${text.id}`);
}

export async function deleteStudentText(studentId: string, textId: string) {
  await prisma.studentText.delete({ where: { id: textId } });
  revalidatePath(`/elever/${studentId}`);
  redirect(`/elever/${studentId}`);
}
