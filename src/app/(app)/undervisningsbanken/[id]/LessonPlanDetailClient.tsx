"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Heart, Star, Trash2, MessageSquareText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

interface RatingItem {
  id: string;
  score: number;
  comment: string | null;
  whatWorked: string | null;
  whatDidntWork: string | null;
  authorName: string;
  createdAt: string;
}

interface LessonPlanDetail {
  id: string;
  title: string;
  subject: string;
  grade: string;
  description: string;
  content: string | null;
  hasFile: boolean;
  fileName: string | null;
  fileSize: number | null;
  authorName: string;
  isOwner: boolean;
  createdAt: string;
  likeCount: number;
  hasLiked: boolean;
  ratings: RatingItem[];
  myRating: { score: number; comment: string | null; whatWorked: string | null; whatDidntWork: string | null } | null;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso)
  );
}

export function LessonPlanDetailClient({ plan }: { plan: LessonPlanDetail }) {
  const router = useRouter();
  const [hasLiked, setHasLiked] = useState(plan.hasLiked);
  const [likeCount, setLikeCount] = useState(plan.likeCount);
  const [deleting, setDeleting] = useState(false);

  const [score, setScore] = useState(plan.myRating?.score ?? 5);
  const [comment, setComment] = useState(plan.myRating?.comment ?? "");
  const [whatWorked, setWhatWorked] = useState(plan.myRating?.whatWorked ?? "");
  const [whatDidntWork, setWhatDidntWork] = useState(plan.myRating?.whatDidntWork ?? "");
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingSaved, setRatingSaved] = useState(false);

  async function toggleLike() {
    const next = !hasLiked;
    setHasLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      await fetch(`/api/undervisningsbanken/${plan.id}/liker`, { method: next ? "POST" : "DELETE" });
    } catch {
      setHasLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    }
  }

  async function submitRating() {
    setRatingSaving(true);
    setRatingError(null);
    setRatingSaved(false);
    try {
      const res = await fetch(`/api/undervisningsbanken/${plan.id}/vurdering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          comment: comment || undefined,
          whatWorked: whatWorked || undefined,
          whatDidntWork: whatDidntWork || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRatingError(data.error ?? "Klarte ikke å lagre vurderingen.");
        setRatingSaving(false);
        return;
      }
      setRatingSaved(true);
      setRatingSaving(false);
      router.refresh();
    } catch {
      setRatingError("Nettverksfeil. Prøv igjen.");
      setRatingSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Er du sikker på at du vil slette dette opplegget? Dette kan ikke angres.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/undervisningsbanken/${plan.id}`, { method: "DELETE" });
      router.push("/undervisningsbanken");
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="primary">{plan.subject}</Badge>
          <Badge variant="neutral">{plan.grade}</Badge>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-foreground">{plan.title}</h1>
        <p className="mt-1 text-sm text-foreground/50">
          Av {plan.authorName} · {formatDate(plan.createdAt)}
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <p className="text-foreground/80">{plan.description}</p>

          {plan.content && (
            <p className="whitespace-pre-wrap rounded-button bg-background-subtle p-3 text-sm text-foreground">
              {plan.content}
            </p>
          )}

          {plan.hasFile && (
            <a
              href={`/api/undervisningsbanken/${plan.id}/fil`}
              className="inline-flex w-fit items-center gap-2 rounded-button border border-line px-3 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              <Download size={16} />
              {plan.fileName}
              {plan.fileSize && <span className="text-foreground/40">({formatFileSize(plan.fileSize)})</span>}
            </a>
          )}

          <div className="flex items-center justify-between border-t border-line pt-4">
            <button
              type="button"
              onClick={toggleLike}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm transition-colors",
                hasLiked ? "text-error" : "text-foreground/60 hover:text-error"
              )}
            >
              <Heart size={16} fill={hasLiked ? "currentColor" : "none"} />
              {likeCount} {likeCount === 1 ? "liker dette" : "liker dette"}
            </button>

            {plan.isOwner && (
              <Button variant="ghost" size="sm" onClick={handleDelete} loading={deleting}>
                <Trash2 size={14} /> Slett
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <MessageSquareText size={18} /> Gi en vurdering
        </h2>
        <Card>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setScore(n)} aria-label={`${n} stjerner`}>
                  <Star
                    size={22}
                    className={n <= score ? "fill-current text-amber-400" : "text-foreground/20"}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              rows={2}
              placeholder="Hva fungerte bra?"
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              value={whatDidntWork}
              onChange={(e) => setWhatDidntWork(e.target.value)}
              rows={2}
              placeholder="Hva fungerte mindre bra? (valgfritt)"
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="Annen kommentar (valgfritt)"
              className="rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {ratingError && <p className="text-sm text-error">{ratingError}</p>}
            {ratingSaved && <p className="text-sm text-success">Vurdering lagret.</p>}
            <Button onClick={submitRating} loading={ratingSaving} className="self-end">
              {plan.myRating ? "Oppdater vurdering" : "Send vurdering"}
            </Button>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-foreground">Vurderinger fra kolleger ({plan.ratings.length})</h2>
        {plan.ratings.length === 0 ? (
          <EmptyState icon={<Star size={28} />} title="Ingen vurderinger ennå" />
        ) : (
          <ul className="flex flex-col gap-3">
            {plan.ratings.map((r) => (
              <li key={r.id} className="rounded-card border border-line bg-background p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={14}
                        className={n <= r.score ? "fill-current text-amber-400" : "text-foreground/20"}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-foreground/40">{formatDate(r.createdAt)}</span>
                </div>
                {r.whatWorked && (
                  <p className="mt-2 text-sm text-foreground">
                    <span className="font-medium">Fungerte bra:</span> {r.whatWorked}
                  </p>
                )}
                {r.whatDidntWork && (
                  <p className="mt-1 text-sm text-foreground">
                    <span className="font-medium">Fungerte mindre bra:</span> {r.whatDidntWork}
                  </p>
                )}
                {r.comment && <p className="mt-1 text-sm text-foreground/80">{r.comment}</p>}
                <p className="mt-2 text-xs text-foreground/40">{r.authorName}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
