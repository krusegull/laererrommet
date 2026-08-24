"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { studentSchema, feedbackLogSchema } from "@/lib/validations";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Ikke innlogget");
  }
  return session.user.id;
}

export async function createStudent(formData: FormData) {
  const userId = await requireUserId();
  const parsed = studentSchema.safeParse({ label: formData.get("label") });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ugyldig navn");
  }

  const student = await prisma.student.create({
    data: { label: parsed.data.label, userId },
  });

  revalidatePath("/logg");
  redirect(`/logg/${student.id}`);
}

export async function createFeedbackLog(formData: FormData) {
  const userId = await requireUserId();
  const parsed = feedbackLogSchema.safeParse({
    studentId: formData.get("studentId"),
    task: formData.get("task"),
    positive: formData.get("positive"),
    improve: formData.get("improve"),
    hasProgress: formData.get("hasProgress") === "on",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ugyldige opplysninger");
  }

  const student = await prisma.student.findUnique({ where: { id: parsed.data.studentId } });
  if (!student || student.userId !== userId) {
    throw new Error("Fant ikke eleven");
  }

  await prisma.feedbackLog.create({
    data: {
      studentId: parsed.data.studentId,
      task: parsed.data.task,
      positive: parsed.data.positive,
      improve: parsed.data.improve,
      hasProgress: parsed.data.hasProgress ?? false,
    },
  });

  revalidatePath(`/logg/${parsed.data.studentId}`);
  revalidatePath("/logg");
}
