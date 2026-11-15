import { prisma } from "@/lib/prisma";

/**
 * Henter en klasse med elever og klassekart, og bekrefter at den tilhører
 * innlogget bruker. Returnerer null hvis klassen ikke finnes eller tilhører
 * noen andre — kall-stedet skal da svare 404, ikke lekke at klassen finnes.
 */
export async function getOwnedClass(classId: string, userId: string) {
  const classProfile = await prisma.classProfile.findUnique({
    where: { id: classId },
    include: {
      students: { orderBy: { createdAt: "asc" } },
      seatingChart: true,
    },
  });

  if (!classProfile || classProfile.userId !== userId) {
    return null;
  }

  return classProfile;
}
