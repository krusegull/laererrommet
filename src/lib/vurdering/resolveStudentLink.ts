import { prisma } from "@/lib/prisma";

/**
 * Finner (eller oppretter) den delte elevprofilen (Student) en klassekart-
 * roster-oppføring hører til, og kobler dem sammen permanent hvis ikke
 * allerede gjort. Samme elev kan stå i flere klasser - ved eksakt navnetreff
 * (uavhengig av store/små bokstaver) blant lærerens eksisterende elevprofiler
 * gjenbrukes den samme profilen, ellers opprettes en ny.
 *
 * `classStudent` må allerede være eierskaps-bekreftet av kall-stedet.
 */
export async function resolveStudentLink(
  classStudent: { id: string; name: string; studentId: string | null },
  userId: string
): Promise<string> {
  if (classStudent.studentId) return classStudent.studentId;

  const name = classStudent.name.trim();
  const existing = await prisma.student.findFirst({
    where: { userId, label: { equals: name, mode: "insensitive" } },
    orderBy: { createdAt: "asc" },
  });

  const student = existing ?? (await prisma.student.create({ data: { userId, label: name } }));

  await prisma.classStudent.update({ where: { id: classStudent.id }, data: { studentId: student.id } });

  return student.id;
}
