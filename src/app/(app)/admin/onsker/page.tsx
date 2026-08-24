import { prisma } from "@/lib/prisma";
import { AdminOnskerClient } from "./AdminOnskerClient";

export default async function AdminOnskerPage() {
  const requests = await prisma.featureRequest.findMany({
    include: { votes: true, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminOnskerClient
      initialRequests={requests
        .map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          category: r.category,
          status: r.status,
          authorName: r.user.name,
          voteCount: r.votes.length,
        }))
        .sort((a, b) => b.voteCount - a.voteCount)}
    />
  );
}
