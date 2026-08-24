import { Users, AlertTriangle, ThumbsUp, Lightbulb } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function AdminOverviewPage() {
  const [userCount, errorReportCount, featureRequestCount, realizedIdeaCount] = await Promise.all([
    prisma.user.count(),
    prisma.errorReport.count(),
    prisma.featureRequest.count(),
    prisma.idea.count({ where: { realized: true } }),
  ]);

  const stats = [
    { label: "Brukere", value: userCount, icon: Users },
    { label: "Feilrapporter", value: errorReportCount, icon: AlertTriangle },
    { label: "Ønsker", value: featureRequestCount, icon: ThumbsUp },
    { label: "Realiserte ideer", value: realizedIdeaCount, icon: Lightbulb },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <Icon size={20} className="mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-foreground/60">{label}</p>
        </Card>
      ))}
    </div>
  );
}
