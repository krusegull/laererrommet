import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeStudentStatus } from "@/lib/studentStatus";
import { StudentListClient } from "./StudentListClient";

export default async function LoggPage() {
  const session = await getServerSession(authOptions);
  const students = await prisma.student.findMany({
    where: { userId: session!.user.id },
    include: { logs: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  const data = students.map((student) => ({
    id: student.id,
    label: student.label,
    logCount: student.logs.length,
    lastLogDate: student.logs[0]?.createdAt.toISOString() ?? null,
    status: computeStudentStatus(student.logs),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tilbakemeldingslogg</h1>
        <p className="mt-1 text-foreground/60">
          Hold styr på styrker og utviklingsområder for elevene dine over tid.
        </p>
      </div>
      <StudentListClient students={data} />
    </div>
  );
}
