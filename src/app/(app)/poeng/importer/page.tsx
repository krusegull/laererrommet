import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ImporterClient } from "./ImporterClient";

/**
 * Mottak av resultater fra konkurransemalen i Læringsportalen. Selve
 * resultatet ligger i adressens #-del (sendes aldri til serveren) og leses
 * av klienten; serveren leverer bare lærerens klasser og elever.
 */
export default async function PoengImporterPage() {
  const session = await getServerSession(authOptions);
  const classes = await prisma.classProfile.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, students: { orderBy: { name: "asc" }, select: { id: true, name: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hent poeng fra konkurranse</h1>
        <p className="mt-1 text-foreground/60">
          Se over poengene, koble hver deltaker til riktig elev og lagre. Poengene havner under eleven i
          Tilbakemeldingsloggen.
        </p>
      </div>
      <ImporterClient classes={classes} />
    </div>
  );
}
