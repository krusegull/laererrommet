import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getOwnedStudent } from "@/lib/getOwnedStudent";
import { SemesterClient } from "./SemesterClient";

export default async function SemesterSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const student = await getOwnedStudent(id, session!.user.id);
  if (!student) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href={`/logg/${student.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={14} /> {student.label}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Semesteroppsummering</h1>
        <p className="mt-1 text-foreground/60">
          Et KI-generert utkast basert på tilbakemeldingsloggen — les gjennom og tilpass før bruk.
        </p>
      </div>

      <SemesterClient
        studentId={student.id}
        studentLabel={student.label}
        hasLogs={student.logs.length > 0}
      />
    </div>
  );
}
