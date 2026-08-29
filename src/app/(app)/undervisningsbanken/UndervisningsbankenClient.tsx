"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Star, Heart, FileText, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LESSON_PLAN_SUBJECTS, LESSON_PLAN_GRADE_BANDS } from "@/lib/validations";
import { cn } from "@/lib/cn";

interface LessonPlanItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  description: string;
  hasFile: boolean;
  authorName: string;
  createdAt: string;
  ratingCount: number;
  avgScore: number | null;
  likeCount: number;
  hasLiked: boolean;
}

export function UndervisningsbankenClient({ initialPlans }: { initialPlans: LessonPlanItem[] }) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [subjectFilter, setSubjectFilter] = useState("alle");
  const [gradeFilter, setGradeFilter] = useState("alle");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      plans.filter((p) => {
        if (subjectFilter !== "alle" && p.subject !== subjectFilter) return false;
        if (gradeFilter !== "alle" && p.grade !== gradeFilter) return false;
        if (search.trim() && !p.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
        return true;
      }),
    [plans, subjectFilter, gradeFilter, search]
  );

  async function toggleLike(item: LessonPlanItem) {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === item.id
          ? { ...p, hasLiked: !p.hasLiked, likeCount: p.likeCount + (p.hasLiked ? -1 : 1) }
          : p
      )
    );
    try {
      await fetch(`/api/undervisningsbanken/${item.id}/liker`, {
        method: item.hasLiked ? "DELETE" : "POST",
      });
    } catch {
      setPlans((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, hasLiked: item.hasLiked, likeCount: item.likeCount } : p))
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk etter tittel…"
            className="min-w-40 flex-1 rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="alle">Alle fag</option>
            {LESSON_PLAN_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="alle">Alle trinn</option>
            {LESSON_PLAN_GRADE_BANDS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <Link href="/undervisningsbanken/nytt">
          <Button size="sm">
            <Plus size={16} /> Del opplegg
          </Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} />}
          title={plans.length === 0 ? "Ingen opplegg delt ennå" : "Ingen treff"}
          description={
            plans.length === 0 ? "Vær den første til å dele et opplegg." : "Prøv et annet søk eller filter."
          }
          actionLabel={plans.length === 0 ? "Del opplegg" : undefined}
          onAction={plans.length === 0 ? () => router.push("/undervisningsbanken/nytt") : undefined}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <li key={item.id}>
              <Card className="flex h-full flex-col">
                <Link href={`/undervisningsbanken/${item.id}`} className="flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="primary">{item.subject}</Badge>
                    <Badge variant="neutral">{item.grade}</Badge>
                    {item.hasFile && (
                      <span className="inline-flex items-center gap-1 text-xs text-foreground/50">
                        <FileText size={12} /> Fil
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-foreground/60 line-clamp-2">{item.description}</p>
                </Link>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-foreground/50">
                  <span>Av {item.authorName}</span>
                  <div className="flex items-center gap-3">
                    {item.avgScore !== null && (
                      <span className="inline-flex items-center gap-1">
                        <Star size={13} className="fill-current text-amber-400" />
                        {item.avgScore.toFixed(1)} ({item.ratingCount})
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleLike(item)}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors",
                        item.hasLiked ? "text-error" : "hover:text-error"
                      )}
                    >
                      <Heart size={13} fill={item.hasLiked ? "currentColor" : "none"} />
                      {item.likeCount}
                    </button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
