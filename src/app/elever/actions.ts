"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createStudent(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const group = String(formData.get("group") ?? "").trim();

  if (!name) {
    throw new Error("Navn er påkrevd");
  }

  const student = await prisma.student.create({
    data: { name, group: group || null },
  });

  revalidatePath("/elever");
  redirect(`/elever/${student.id}`);
}
