"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import type { StudentStatus } from "@/lib/studentStatus";
import { STATUS_LABEL } from "@/lib/studentStatus";
import { createStudent } from "./actions";

interface StudentSummary {
  id: string;
  label: string;
  logCount: number;
  lastLogDate: string | null;
  status: StudentStatus;
}

const STATUS_BADGE: Record<StudentStatus, "success" | "neutral" | "error"> = {
  positive: "success",
  neutral: "neutral",
  negative: "error",
};

const STATUS_FILTERS: { value: StudentStatus | "all"; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "positive", label: "Viser fremgang" },
  { value: "neutral", label: "Ingen logger" },
  { value: "negative", label: "Trenger oppfølging" },
];

export function StudentListClient({ students }: { students: StudentSummary[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.label.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <Input
              placeholder="Søk etter elev…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StudentStatus | "all")}
            className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Legg til elev
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title={students.length === 0 ? "Ingen elever registrert ennå" : "Ingen treff"}
          description={
            students.length === 0
              ? "Legg til en elev for å begynne å føre tilbakemeldingslogg."
              : "Prøv et annet søk eller filter."
          }
          actionLabel={students.length === 0 ? "Legg til elev" : undefined}
          onAction={students.length === 0 ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((student) => (
            <Link key={student.id} href={`/logg/${student.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground">{student.label}</p>
                  <Badge variant={STATUS_BADGE[student.status]}>{STATUS_LABEL[student.status]}</Badge>
                </div>
                <p className="mt-2 text-sm text-foreground/60">
                  {student.logCount} {student.logCount === 1 ? "logg" : "logger"}
                  {student.lastLogDate && (
                    <>
                      {" "}
                      · sist{" "}
                      {new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" }).format(
                        new Date(student.lastLogDate)
                      )}
                    </>
                  )}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Legg til elev">
        <form action={createStudent} className="flex flex-col gap-4">
          <Input
            label="Navn på elevmerkelapp"
            name="label"
            required
            placeholder="F.eks. Elev A, eller initialer"
            hint="Bruk gjerne en anonymisert merkelapp fremfor fullt navn."
          />
          <Button type="submit" className="self-end">
            Legg til
          </Button>
        </form>
      </Modal>
    </div>
  );
}
