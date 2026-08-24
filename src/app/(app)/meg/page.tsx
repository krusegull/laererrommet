import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MegClient } from "./MegClient";

export default async function MegPage() {
  const session = await getServerSession(authOptions);
  const notes = await prisma.privateNote.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meg</h1>
        <p className="mt-1 text-foreground/60">
          Ditt private rom for refleksjon og egenutvikling. Bare du kan se det som ligger her.
        </p>
      </div>

      <MegClient
        initialNotes={notes.map((note) => ({
          id: note.id,
          type: note.type,
          content: note.content,
          period: note.period,
          source: note.source,
          createdAt: note.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
