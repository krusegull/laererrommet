import { prisma } from "@/lib/prisma";
import { IdeerClient } from "./IdeerClient";

export default async function AdminIdeerPage() {
  const ideas = await prisma.idea.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <IdeerClient
      initialIdeas={ideas.map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        category: i.category,
        realized: i.realized,
        createdAt: i.createdAt.toISOString(),
      }))}
    />
  );
}
