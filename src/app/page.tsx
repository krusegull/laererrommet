import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [studentCount, textCount, annotationCount, lessonPlanCount, recentTexts] =
    await Promise.all([
      prisma.student.count(),
      prisma.studentText.count(),
      prisma.annotation.count(),
      prisma.lessonPlan.count(),
      prisma.studentText.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { student: true, _count: { select: { annotations: true } } },
      }),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Velkommen til Lærerrommet</h1>
        <p className="mt-1 text-slate-600">
          Gi presise tilbakemeldinger på elevtekster, og finn igjen undervisningsopplegg —
          alt på ett sted.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Elever" value={studentCount} />
        <Stat label="Elevtekster" value={textCount} />
        <Stat label="Kommentarer gitt" value={annotationCount} />
        <Stat label="Undervisningsopplegg" value={lessonPlanCount} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/elever"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-teal-300"
        >
          <h2 className="font-semibold text-slate-900 group-hover:text-teal-700">
            Elever og tilbakemeldinger
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Lim inn elevtekster, marker og kommenter direkte i teksten. Se tidligere
            styrker og utviklingsområder for hver elev.
          </p>
        </Link>
        <Link
          href="/opplegg"
          className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-teal-300"
        >
          <h2 className="font-semibold text-slate-900 group-hover:text-teal-700">
            Undervisningsopplegg
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Last opp og finn undervisningsopplegg sortert på fag — Norsk, Samfunnsfag,
            KRLE og flere.
          </p>
        </Link>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Siste elevtekster</h2>
        {recentTexts.length === 0 ? (
          <p className="text-sm text-slate-500">
            Ingen elevtekster registrert ennå.{" "}
            <Link href="/elever" className="font-medium text-teal-700 hover:underline">
              Legg til en elev
            </Link>{" "}
            for å komme i gang.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {recentTexts.map((text) => (
              <li key={text.id}>
                <Link
                  href={`/elever/${text.studentId}/tekster/${text.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{text.title}</p>
                    <p className="text-sm text-slate-500">{text.student.name}</p>
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
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
