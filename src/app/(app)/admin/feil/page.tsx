import { prisma } from "@/lib/prisma";
import { FeilClient } from "./FeilClient";

export default async function AdminFeilPage() {
  const reports = await prisma.errorReport.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  });

  return (
    <FeilClient
      initialReports={reports.map((r) => ({
        id: r.id,
        page: r.page,
        description: r.description,
        error: r.error,
        status: r.status,
        userEmail: r.user.email,
        userName: r.user.name,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
