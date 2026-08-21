import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSubject, deleteLessonPlan, uploadLessonPlan } from "./actions";

const FILE_ICONS: Record<string, string> = {
  pdf: "📄",
  doc: "📝",
  docx: "📝",
  ppt: "📊",
  pptx: "📊",
  xls: "📈",
  xlsx: "📈",
};

function fileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return FILE_ICONS[ext] ?? "📎";
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function LessonPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ fag?: string }>;
}) {
  const { fag } = await searchParams;

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { lessonPlans: true } } },
  });

  const activeSubject = fag ? subjects.find((s) => s.id === fag) : undefined;

  const lessonPlans = await prisma.lessonPlan.findMany({
    where: activeSubject ? { subjectId: activeSubject.id } : undefined,
    orderBy: { createdAt: "desc" },
    include: { subject: true },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Undervisningsopplegg</h1>
        <p className="mt-1 text-slate-600">
          Last opp og finn igjen undervisningsopplegg, sortert på fag.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/opplegg"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            !activeSubject
              ? "bg-teal-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
          } border border-slate-200`}
        >
          Alle fag
        </Link>
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/opplegg?fag=${subject.id}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              activeSubject?.id === subject.id
                ? "bg-teal-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            } border border-slate-200`}
          >
            {subject.name} ({subject._count.lessonPlans})
          </Link>
        ))}
        <details className="relative ml-1">
          <summary className="cursor-pointer list-none rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
            + Nytt fag
          </summary>
          <form
            action={createSubject}
            className="absolute z-10 mt-2 flex gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
          >
            <input
              type="text"
              name="name"
              required
              placeholder="F.eks. Matematikk"
              className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="rounded-md bg-teal-600 px-3 py-1 text-sm font-medium text-white hover:bg-teal-700"
            >
              Legg til
            </button>
          </form>
        </details>
      </div>

      <div className="grid gap-8 sm:grid-cols-[2fr_1fr]">
        <div>
          {lessonPlans.length === 0 ? (
            <p className="text-sm text-slate-500">
              Ingen undervisningsopplegg her ennå. Last opp det første til høyre.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {lessonPlans.map((plan) => (
                <li
                  key={plan.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex gap-3">
                    <span className="text-2xl">{fileIcon(plan.fileName)}</span>
                    <div>
                      <a
                        href={`/api/opplegg/${plan.id}`}
                        className="font-medium text-slate-900 hover:text-teal-700 hover:underline"
                      >
                        {plan.title}
                      </a>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">
                          {plan.subject.name}
                        </span>
                        {plan.grade && <span>{plan.grade}</span>}
                        <span>{formatSize(plan.fileSize)}</span>
                        <span>
                          {new Date(plan.createdAt).toLocaleDateString("nb-NO", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
                      )}
                    </div>
                  </div>
                  <form action={deleteLessonPlan.bind(null, plan.id)}>
                    <button
                      type="submit"
                      className="shrink-0 text-xs text-slate-400 hover:text-red-600"
                    >
                      Slett
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          action={uploadLessonPlan}
          className="flex h-fit flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">Last opp opplegg</h2>
          <label className="flex flex-col gap-1 text-sm">
            Tittel
            <input
              type="text"
              name="title"
              required
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="F.eks. Norrøn mytologi"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Fag
            <select
              name="subjectId"
              required
              defaultValue={activeSubject?.id ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="" disabled>
                Velg fag
              </option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Trinn (valgfritt)
            <input
              type="text"
              name="grade"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="F.eks. 8.-10. trinn"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Beskrivelse (valgfritt)
            <textarea
              name="description"
              rows={3}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Fil
            <input
              type="file"
              name="file"
              required
              className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
            />
          </label>
          <button
            type="submit"
            className="mt-1 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Last opp
          </button>
        </form>
      </div>
    </div>
  );
}
