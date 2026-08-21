import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createStudentText } from "./actions";
import { CATEGORY_META } from "@/lib/feedback";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      texts: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { annotations: true } } },
      },
    },
  });

  if (!student) notFound();

  const annotations = await prisma.annotation.findMany({
    where: { text: { studentId } },
    orderBy: { createdAt: "desc" },
    include: { text: true },
  });

  const strengths = annotations.filter((a) => a.category === "STYRKE");
  const growthAreas = annotations.filter((a) => a.category === "UTVIKLING");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
          {student.group && <p className="mt-1 text-slate-600">{student.group}</p>}
        </div>
        <Link
          href="/elever"
          className="text-sm font-medium text-teal-700 hover:underline"
        >
          ← Alle elever
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <FeedbackSummary
          title="Styrker å bygge videre på"
          emptyText="Ingen styrker registrert ennå."
          items={strengths}
          accent="emerald"
        />
        <FeedbackSummary
          title="Utviklingsområder å følge opp"
          emptyText="Ingen utviklingsområder registrert ennå."
          items={growthAreas}
          accent="amber"
        />
      </section>

      <section className="grid gap-8 sm:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Elevtekster</h2>
          {student.texts.length === 0 ? (
            <p className="text-sm text-slate-500">Ingen tekster registrert ennå.</p>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {student.texts.map((text) => (
                <li key={text.id}>
                  <Link
                    href={`/elever/${studentId}/tekster/${text.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{text.title}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(text.createdAt).toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-slate-400">
                      {text._count.annotations} kommentar
                      {text._count.annotations === 1 ? "" : "er"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          action={createStudentText.bind(null, studentId)}
          className="flex h-fit flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">Ny elevtekst</h2>
          <label className="flex flex-col gap-1 text-sm">
            Tittel
            <input
              type="text"
              name="title"
              required
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="F.eks. Fortellingstekst uke 34"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Tekst
            <textarea
              name="content"
              required
              rows={8}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="Lim inn elevteksten her..."
            />
          </label>
          <button
            type="submit"
            className="mt-1 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Lagre tekst
          </button>
        </form>
      </section>
    </div>
  );
}

function FeedbackSummary({
  title,
  emptyText,
  items,
  accent,
}: {
  title: string;
  emptyText: string;
  items: {
    id: string;
    quote: string;
    comment: string;
    createdAt: Date;
    text: { id: string; title: string; studentId: string };
  }[];
  accent: "emerald" | "amber";
}) {
  const meta = accent === "emerald" ? CATEGORY_META.STYRKE : CATEGORY_META.UTVIKLING;

  return (
    <div className={`rounded-xl border p-5 ${meta.border} ${meta.bg}`}>
      <h2 className={`font-semibold ${meta.text}`}>{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {items.slice(0, 6).map((item) => (
            <li key={item.id} className="text-sm">
              <Link
                href={`/elever/${item.text.studentId}/tekster/${item.text.id}`}
                className="font-medium text-slate-800 hover:underline"
              >
                &ldquo;{item.quote}&rdquo;
              </Link>
              <p className="text-slate-600">{item.comment}</p>
              <p className="text-xs text-slate-400">{item.text.title}</p>
            </li>
          ))}
        </ul>
      )}
      {items.length > 6 && (
        <p className="mt-2 text-xs text-slate-400">+ {items.length - 6} til</p>
      )}
    </div>
  );
}
