import { prisma } from "@/lib/prisma";

/**
 * Henter en elev og bekrefter at den tilhører innlogget bruker.
 * Returnerer null hvis eleven ikke finnes eller tilhører noen andre —
 * kall-stedet skal da svare 404, ikke lekke at eleven finnes.
 */
export async function getOwnedStudent(studentId: string, userId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { logs: { orderBy: { createdAt: "desc" } } },
  });

  if (!student || student.userId !== userId) {
    return null;
  }

  return student;
}
