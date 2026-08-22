import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createStudent } from "./actions";

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { texts: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Elever</h1>
        <p className="mt-1 text-slate-600">
          Velg en elev for å se tidligere tilbakemeldinger, eller legg til en ny elev.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-[2fr_1fr]">
        <div>
          {students.length === 0 ? (
            <p className="text-sm text-slate-500">Ingen elever registrert ennå.</p>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {students.map((student) => (
                <li key={student.id}>
                  <Link
                    href={`/elever/${student.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{student.name}</p>
                      {student.group && (
                        <p className="text-sm text-slate-500">{student.group}</p>
                      )}
                    </div>
                    <span className="whitespace-nowrap text-xs text-slate-400">
                      {student._count.texts} tekst{student._count.texts === 1 ? "" : "er"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          action={createStudent}
          className="flex h-fit flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">Legg til elev</h2>
          <label className="flex flex-col gap-1 text-sm">
            Navn
            <input
              type="text"
              name="name"
              required
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="F.eks. Kari Nordmann"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Klasse / gruppe (valgfritt)
            <input
              type="text"
              name="group"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="F.eks. 9B"
            />
          </label>
          <button
            type="submit"
            className="mt-1 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Legg til
          </button>
        </form>
      </div>
    </div>
  );
}
