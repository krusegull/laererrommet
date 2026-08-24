import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Lightbulb, Dumbbell, FileText, CalendarClock, CheckCircle2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getOwnedStudent } from "@/lib/getOwnedStudent";
import { computeStudentStatus, STATUS_LABEL } from "@/lib/studentStatus";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { AIActionCard } from "@/components/AIActionCard";
import { NewFeedbackButton } from "./NewFeedbackButton";

const STATUS_BADGE = { positive: "success", neutral: "neutral", negative: "error" } as const;

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const student = await getOwnedStudent(id, session!.user.id);
  if (!student) notFound();

  const status = computeStudentStatus(student.logs);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/logg" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <ArrowLeft size={14} /> Tilbakemeldingslogg
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">{student.label}</h1>
          <Badge variant={STATUS_BADGE[status]}>{STATUS_LABEL[status]}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Tidslinje</h2>
            <div className="flex gap-2">
              <NewFeedbackButton studentId={student.id} />
              <Link href={`/logg/${student.id}/semester`}>
                <Button variant="secondary" size="sm">
                  <FileText size={16} /> Semesteroppsummering
                </Button>
              </Link>
            </div>
          </div>

          {student.logs.length === 0 ? (
            <EmptyState
              icon={<CalendarClock size={32} />}
              title="Ingen tilbakemeldinger ennå"
              description="Legg til den første loggen for å komme i gang."
            />
          ) : (
            <ul className="flex flex-col gap-4">
              {student.logs.map((log) => (
                <li key={log.id} className="rounded-card border border-line bg-background p-4 shadow-card">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{log.task}</p>
                    {log.hasProgress && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                        <CheckCircle2 size={14} /> Fremgang
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-foreground/50">
                    {new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" }).format(
                      log.createdAt
                    )}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-button bg-success/5 p-3 text-sm text-foreground">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-success">Bra</p>
                      {log.positive}
                    </div>
                    <div className="rounded-button bg-sky-500/5 p-3 text-sm text-foreground">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sky-600">
                        Utviklingsområde
                      </p>
                      {log.improve}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {student.logs.length > 0 && (
            <AIActionCard
              endpoint="/api/logg/forslag"
              studentId={student.id}
              title="KI-forslag"
              description="Mønstre basert på tidligere tilbakemeldinger."
              actionLabel="Vis forslag"
              icon={<Lightbulb size={18} />}
              autoLoad
            />
          )}
          <AIActionCard
            endpoint="/api/logg/ovingsoppdrag"
            studentId={student.id}
            title="Øvingsoppdrag"
            description="Få et konkret forslag til øvingsoppdrag basert på utviklingsområdene."
            actionLabel="Lag øvingsoppdrag"
            icon={<Dumbbell size={18} />}
          />
          <AIActionCard
            endpoint="/api/logg/iop"
            studentId={student.id}
            title="IOP-punkt"
            description="Få et utkast til et IOP-punkt du selv kvalitetssikrer."
            actionLabel="Foreslå IOP-punkt"
            icon={<FileText size={18} />}
          />
        </div>
      </div>
    </div>
  );
}
