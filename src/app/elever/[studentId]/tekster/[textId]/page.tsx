import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORY_META } from "@/lib/feedback";
import { AnnotationEditor } from "./annotation-editor";

export default async function StudentTextPage({
  params,
}: {
  params: Promise<{ studentId: string; textId: string }>;
}) {
  const { studentId, textId } = await params;

  const text = await prisma.studentText.findUnique({
    where: { id: textId },
    include: { student: true, annotations: true },
  });

  if (!text || text.studentId !== studentId) notFound();

  const pastAnnotations = await prisma.annotation.findMany({
    where: { text: { studentId }, textId: { not: textId } },
    orderBy: { createdAt: "desc" },
    include: { text: true },
    take: 10,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/elever/${studentId}`}
            className="text-sm font-medium text-teal-700 hover:underline"
          >
            ← {text.student.name}
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{text.title}</h1>
          <p className="text-sm text-slate-500">
            {new Date(text.createdAt).toLocaleDateString("nb-NO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <AnnotationEditor
          studentId={studentId}
          textId={textId}
          content={text.content}
          initialAnnotations={text.annotations}
        />

        <aside className="flex h-fit flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">
            Tidligere tilbakemeldinger til {text.student.name}
          </h2>
          <p className="text-xs text-slate-500">
            Bruk disse som referanse for å følge opp mønstre over tid.
          </p>
          {pastAnnotations.length === 0 ? (
            <p className="text-sm text-slate-500">Ingen tidligere kommentarer.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {pastAnnotations.map((a) => (
                <li key={a.id} className="text-sm">
                  <span
                    className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_META[a.category].text} ${CATEGORY_META[a.category].bg}`}
                  >
                    {CATEGORY_META[a.category].label}
                  </span>
                  <p className="text-slate-700">{a.comment}</p>
                  <p className="text-xs text-slate-400">{a.text.title}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
