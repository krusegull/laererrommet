import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { ROOM_OBJECT_TYPES, importClassImageSchema } from "@/lib/validations";
import { getOwnedClass } from "@/lib/klassekart/getOwnedClass";
import { askClaudeWithImage, AIUnavailableError } from "@/lib/anthropic";
import type { Pod, PodSeats, RoomObject } from "@/lib/klassekart/types";

const SYSTEM_PROMPT =
  "Du hjelper en lærer å digitalisere et klasseromskart (ofte fra en PowerPoint-slide) til strukturert JSON. " +
  "Se nøye på bildet og identifiser (1) møbler/gjenstander i rommet og (2) pultgrupper med elevnavn. " +
  "Svar KUN med gyldig JSON på nøyaktig denne formen, ingen forklaring og ingen markdown-blokk:\n" +
  '{"roomObjects":[{"type":"dor|tavle|vindu|kateter|laerer|bokhylle|egen","label":"tekst fra bildet","x":0-100,"y":0-100}],' +
  '"groups":[{"x":0-100,"y":0-100,"students":["Navn1","Navn2"]}]}\n' +
  "x/y er posisjon i prosent av bildet (0,0 er øverst til venstre). Bruk \"egen\" for gjenstander som ikke passer " +
  "de andre typene (behold den opprinnelige teksten som label, f.eks. \"PC-skap\"). Hver gruppe er pultene som " +
  "står fysisk sammen, med elevnavnene som står skrevet der, i lesbar rekkefølge. Skriv navnene nøyaktig som de " +
  "står i bildet.";

function clampPct(n: unknown): number {
  const num = typeof n === "number" && Number.isFinite(n) ? n : 50;
  return Math.max(0, Math.min(100, num));
}

export async function POST(request: Request, { params }: { params: Promise<{ classId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { classId } = await params;
  const classProfile = await getOwnedClass(classId, session.user.id);
  if (!classProfile) {
    return NextResponse.json({ error: "Fant ikke klassen" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = importClassImageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  let raw: string;
  try {
    raw = await askClaudeWithImage({
      system: SYSTEM_PROMPT,
      prompt: "Les av klasseromskartet i bildet og svar med JSON som beskrevet.",
      imageBase64: parsed.data.imageBase64,
      mediaType: parsed.data.mediaType,
      maxTokens: 4096,
    });
  } catch (error) {
    if (error instanceof AIUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Import av klassekartbilde feilet:", error);
    return NextResponse.json({ error: "Klarte ikke å lese bildet akkurat nå. Prøv igjen." }, { status: 502 });
  }

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    return NextResponse.json({ error: "Klarte ikke å tolke bildet. Prøv et tydeligere bilde." }, { status: 422 });
  }

  let extracted: { roomObjects?: unknown[]; groups?: unknown[] };
  try {
    extracted = JSON.parse(match[0]);
  } catch {
    return NextResponse.json({ error: "Klarte ikke å tolke bildet. Prøv et tydeligere bilde." }, { status: 422 });
  }

  const roomObjects: RoomObject[] = (extracted.roomObjects ?? [])
    .filter((o): o is Record<string, unknown> => typeof o === "object" && o !== null)
    .map((o, i) => {
      const type = typeof o.type === "string" && (ROOM_OBJECT_TYPES as readonly string[]).includes(o.type)
        ? (o.type as RoomObject["type"])
        : "egen";
      return {
        id: "import-" + i,
        type,
        label: typeof o.label === "string" && o.label.trim() ? o.label.trim().slice(0, 60) : type,
        x: clampPct(o.x),
        y: clampPct(o.y),
      };
    });

  const groups = (extracted.groups ?? [])
    .filter((g): g is Record<string, unknown> => typeof g === "object" && g !== null)
    .map((g) => ({
      x: clampPct(g.x),
      y: clampPct(g.y),
      students: Array.isArray(g.students)
        ? g.students.filter((n): n is string => typeof n === "string" && n.trim().length > 0).map((n) => n.trim())
        : [],
    }))
    .filter((g) => g.students.length > 0);

  if (groups.length === 0) {
    return NextResponse.json(
      { error: "Fant ingen elevnavn i bildet. Prøv et tydeligere bilde." },
      { status: 422 }
    );
  }

  // Slett eksisterende elever/romoppsett for klassen før import - dette er ment å
  // sette opp klassen fra bunnen av et tidligere kart, ikke slå sammen med noe.
  await prisma.classStudent.deleteMany({ where: { classProfileId: classId } });

  const podLayout: Pod[] = [];
  const pods: PodSeats = [];
  let genderToggle = 0;

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const seatIds: (string | null)[] = [];
    for (const name of group.students) {
      const student = await prisma.classStudent.create({
        data: { classProfileId: classId, name, gender: genderToggle % 2 === 0 ? "gutt" : "jente" },
      });
      genderToggle++;
      seatIds.push(student.id);
    }
    podLayout.push({ id: i + 1, size: seatIds.length, x: group.x, y: group.y });
    pods.push(seatIds);
  }

  await prisma.seatingChart.update({
    where: { classProfileId: classId },
    data: {
      roomObjects: roomObjects as unknown as Prisma.InputJsonValue,
      podLayout: podLayout as unknown as Prisma.InputJsonValue,
      pods,
      locks: [],
    },
  });

  const students = await prisma.classStudent.findMany({
    where: { classProfileId: classId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    roomObjects,
    podLayout,
    pods,
    students: students.map((s) => ({ id: s.id, name: s.name, gender: s.gender })),
  });
}
