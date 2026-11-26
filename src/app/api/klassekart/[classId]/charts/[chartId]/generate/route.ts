import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { generateSeatingSchema } from "@/lib/validations";
import { getOwnedChart } from "@/lib/klassekart/getOwnedChart";
import { generateSeating, repairPods, validLocks } from "@/lib/klassekart/seating";
import { askClaude, AIUnavailableError } from "@/lib/anthropic";
import type { LockEntry, Pod, PodSeats, RoomObject, StudentLite } from "@/lib/klassekart/types";

const SYSTEM_PROMPT =
  "Du hjelper en lærer å plassere elever på pulter i et klasserom ut fra en instruks. " +
  "Du får elevlisten (id, navn, kjønn), pultgruppene (indeks, antall seter, posisjon i rommet som " +
  "prosent x/y - lavere y er nærmere fronten av rommet), møblene i rommet (type, navn, posisjon, f.eks. " +
  "tavle/dør/vindu) som hjelp til å forstå hva «foran», «bakerst», «nær vinduet/døra» osv. betyr, og " +
  "eventuelle elever som allerede er låst til en bestemt plass (disse MÅ bli værende nøyaktig der). " +
  "Følg lærerens instruks så godt som mulig. Der instruksen ikke sier noe spesifikt, fordel elevene " +
  "noenlunde jevnt mellom gutter og jenter. " +
  "Svar KUN med gyldig JSON på nøyaktig denne formen, ingen forklaring og ingen markdown-blokk:\n" +
  '{"pods":[["elevId1","elevId2"],["elevId3"]]}\n' +
  "«pods» må ha nøyaktig like mange grupper, i samme rekkefølge, med nøyaktig like mange elev-id-er per " +
  "gruppe, som pultgruppene du fikk oppgitt. Bruk hver elev-id nøyaktig én gang totalt.";

function buildUserMessage(
  students: StudentLite[],
  podLayout: Pod[],
  roomObjects: RoomObject[],
  locks: LockEntry[],
  instruks: string
) {
  const lockedNote = locks.length
    ? locks
        .map((l) => {
          const student = students.find((s) => s.id === l.studentId);
          return student ? `${student.name} (id ${student.id}) MÅ sitte i pultgruppe ${l.podIndex}, sete ${l.seatIndex}` : null;
        })
        .filter(Boolean)
        .join("\n")
    : "Ingen låste elever.";

  return [
    "Elever:",
    students.map((s) => `${s.id}: ${s.name} (${s.gender})`).join("\n"),
    "",
    "Pultgrupper (indeks: antall seter, x%, y%):",
    podLayout.map((p, i) => `${i}: ${p.size} seter, x=${p.x}, y=${p.y}`).join("\n"),
    "",
    "Møbler i rommet:",
    roomObjects.map((o) => `${o.label} (${o.type}): x=${o.x}, y=${o.y}`).join("\n") || "Ingen møbler lagt inn.",
    "",
    "Låste elever:",
    lockedNote,
    "",
    "Instruks fra læreren:",
    instruks,
  ].join("\n");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ classId: string; chartId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId, chartId } = await params;
  const chart = await getOwnedChart(classId, chartId, session.user.id);
  if (!chart) {
    return NextResponse.json({ error: "Fant ikke klassekartet" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = generateSeatingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const podLayout = (chart.podLayout as unknown as Pod[] | null) ?? [];
  if (podLayout.length === 0) {
    return NextResponse.json({ error: "Legg til pultgrupper før du genererer et klassekart" }, { status: 400 });
  }

  const students: StudentLite[] = chart.classProfile.students.map((s) => ({
    id: s.id,
    name: s.name,
    gender: s.gender as "gutt" | "jente" | "ukjent",
  }));
  const existingLocks = (chart.locks as unknown as LockEntry[] | null) ?? [];
  const roomObjects = (chart.roomObjects as unknown as RoomObject[] | null) ?? [];

  let pods: PodSeats;
  let locks: LockEntry[];
  let aiFallback = false;

  if (parsed.data.instruks) {
    const keptLocks = validLocks(existingLocks, students, podLayout);
    try {
      const raw = await askClaude({
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: buildUserMessage(students, podLayout, roomObjects, keptLocks, parsed.data.instruks) },
        ],
        maxTokens: 4096,
      });
      const match = raw.match(/\{[\s\S]*\}/);
      const aiPods = match ? JSON.parse(match[0])?.pods : null;
      pods = repairPods(aiPods, podLayout, students, keptLocks);
      locks = keptLocks;
    } catch (error) {
      if (!(error instanceof AIUnavailableError)) console.error("KI-basert klassekart feilet:", error);
      const fallback = generateSeating(students, podLayout, existingLocks);
      pods = fallback.pods;
      locks = fallback.locks;
      aiFallback = true;
    }
  } else {
    const result = generateSeating(students, podLayout, existingLocks);
    pods = result.pods;
    locks = result.locks;
  }

  await prisma.seatingChart.update({
    where: { id: chartId },
    data: { pods, locks: locks as unknown as Prisma.InputJsonValue },
  });

  return NextResponse.json({ pods, locks, aiFallback });
}
