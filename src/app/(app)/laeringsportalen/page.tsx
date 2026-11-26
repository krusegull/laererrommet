import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Grupper } from "@/lib/klassekart/types";
import { PortalClient, type PortalKlasse } from "./PortalClient";

/**
 * Alt fra Læringsportalen (elevenes side) samlet for læreren: verktøy per
 * fag og tema, og de ferdige konkurransene, som kan startes med en klasse.
 */
export default async function LaeringsportalenPage() {
  const session = await getServerSession(authOptions);
  const classes = await prisma.classProfile.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      students: { orderBy: { name: "asc" }, select: { id: true, name: true } },
      seatingCharts: { orderBy: { updatedAt: "desc" }, select: { label: true, grupper: true } },
    },
  });

  const klasser: PortalKlasse[] = classes.map((c) => {
    const ids = new Set(c.students.map((s) => s.id));
    // Nyeste kart som har grupper med elever som fortsatt er i klassen.
    const kart = c.seatingCharts
      .map((k) => ({ label: k.label, grupper: ((k.grupper as Grupper) ?? []).map((g) => g.filter((id) => ids.has(id))).filter((g) => g.length) }))
      .find((k) => k.grupper.length > 0);
    return { id: c.id, name: c.name, students: c.students, grupper: kart?.grupper ?? [], kart: kart?.label ?? null };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Læringsportalen</h1>
        <p className="mt-1 text-foreground/60">
          Alt elevene har i portalen, samlet per fag og tema. Konkurransene kan startes direkte med en klasse, og poengene
          sendes tilbake hit etter spillet.
        </p>
      </div>
      <PortalClient klasser={klasser} />
    </div>
  );
}
