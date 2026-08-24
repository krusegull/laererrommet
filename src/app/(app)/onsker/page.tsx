import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnskerClient } from "./OnskerClient";

export default async function OnskerPage() {
  const session = await getServerSession(authOptions);
  const requests = await prisma.featureRequest.findMany({
    include: { votes: true, user: { select: { name: true } } },
  });

  const data = requests
    .map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      status: r.status,
      authorName: r.user.name,
      createdAt: r.createdAt.toISOString(),
      voteCount: r.votes.length,
      hasVoted: r.votes.some((v) => v.userId === session!.user.id),
    }))
    .sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ønsker til appen</h1>
        <p className="mt-1 text-foreground/60">
          Foreslå og stem på hva som skal bygges videre i Lærerrommet.
        </p>
      </div>
      <OnskerClient initialRequests={data} />
    </div>
  );
}
