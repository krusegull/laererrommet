import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { grupperRequestSchema } from "@/lib/validations";
import { getOwnedClass } from "@/lib/klassekart/getOwnedClass";
import { historyCount, randomGroups, recordHistory } from "@/lib/klassekart/seating";
import { askClaude, AIUnavailableError } from "@/lib/anthropic";
import type { Grupper, PairHistory, StudentLite } from "@/lib/klassekart/types";

function buildWarnings(groups: Grupper, pairHistory: PairHistory, students: StudentLite[]) {
  const nameOf = new Map(students.map((s) => [s.id, s.name]));
  const warnings: string[] = [];
  groups.forEach((group) => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const count = historyCount(pairHistory, group[i], group[j]);
        if (count > 0) {
          const a = nameOf.get(group[i]) ?? "?";
          const b = nameOf.get(group[j]) ?? "?";
          warnings.push(`${a} og ${b} har vært på gruppe sammen før (${count}x)`);
        }
      }
    }
  });
  return warnings;
}

async function groupsFromInstruction(students: StudentLite[], instruks: string): Promise<Grupper | null> {
  const roster = students.map((s) => `${s.id}: ${s.name} (${s.gender})`).join("\n");
  const system =
    "Du hjelper en lærer å dele en klasse inn i grupper etter en instruks. " +
    "Svar KUN med gyldig JSON: en liste av lister med elev-id-er, f.eks. [[\"id1\",\"id2\"],[\"id3\",\"id4\"]]. " +
    "Bruk nøyaktig de elev-id-ene som er gitt. Hver elev skal være med i nøyaktig én gruppe. " +
    "Ingen forklaring, ingen markdown-blokk, bare JSON-arrayet.";
  const userMessage = `Elever:\n${roster}\n\nInstruks fra læreren: ${instruks}`;

  let raw: string;
  try {
    raw = await askClaude({ system, messages: [{ role: "user", content: userMessage }], maxTokens: 2048 });
  } catch (error) {
    if (error instanceof AIUnavailableError) return null;
    console.error("KI-gruppering feilet:", error);
    return null;
  }

  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return null;
    const validIds = new Set(students.map((s) => s.id));
    const groups: Grupper = parsed
      .filter((group): group is string[] => Array.isArray(group))
      .map((group) => group.filter((id): id is string => typeof id === "string" && validIds.has(id)));
    const coveredIds = new Set(groups.flat());
    if (coveredIds.size === 0) return null;
    return groups.filter((g) => g.length > 0);
  } catch {
    return null;
  }
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
  const parsed = grupperRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }
  const { mode, size, instruks, manualGroups } = parsed.data;

  const students: StudentLite[] = classProfile.students.map((s) => ({
    id: s.id,
    name: s.name,
    gender: s.gender as "gutt" | "jente",
  }));
  const validIds = new Set(students.map((s) => s.id));

  let groups: Grupper;
  let aiFallback = false;

  if (mode === "random") {
    groups = randomGroups(students, size ?? 4);
  } else if (mode === "manuell") {
    if (!manualGroups) {
      return NextResponse.json({ error: "Mangler gruppeinndeling" }, { status: 400 });
    }
    groups = manualGroups.map((group) => group.filter((id) => validIds.has(id)));
  } else {
    if (!instruks) {
      return NextResponse.json({ error: "Skriv en instruks for gruppene" }, { status: 400 });
    }
    const aiGroups = await groupsFromInstruction(students, instruks);
    if (aiGroups && aiGroups.length > 0) {
      groups = aiGroups;
    } else {
      groups = randomGroups(students, size ?? 4);
      aiFallback = true;
    }
  }

  const pairHistory = (classProfile.seatingChart?.pairHistory as PairHistory | null) ?? {};
  const warnings = buildWarnings(groups, pairHistory, students);
  const nextPairHistory = recordHistory(pairHistory, groups);

  await prisma.seatingChart.update({
    where: { classProfileId: classId },
    data: { grupper: groups, pairHistory: nextPairHistory },
  });

  return NextResponse.json({ grupper: groups, warnings, aiFallback });
}
