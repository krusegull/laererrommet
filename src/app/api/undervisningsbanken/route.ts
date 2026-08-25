import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  lessonPlanSchema,
  LESSON_PLAN_SUBJECTS,
  LESSON_PLAN_GRADE_BANDS,
  LESSON_PLAN_MAX_FILE_SIZE,
  LESSON_PLAN_ALLOWED_FILE_TYPES,
} from "@/lib/validations";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject");
  const grade = searchParams.get("grade");
  const search = searchParams.get("q")?.trim();

  const plans = await prisma.lessonPlan.findMany({
    where: {
      ...(subject ? { subject } : {}),
      ...(grade ? { grade } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { name: true } },
      ratings: { select: { score: true } },
      likes: { select: { userId: true } },
      _count: { select: { ratings: true, likes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = plans.map((p) => {
    const avgScore =
      p.ratings.length > 0 ? p.ratings.reduce((sum, r) => sum + r.score, 0) / p.ratings.length : null;
    return {
      id: p.id,
      title: p.title,
      subject: p.subject,
      grade: p.grade,
      description: p.description,
      hasFile: Boolean(p.fileName),
      fileName: p.fileName,
      authorName: p.user.name,
      createdAt: p.createdAt.toISOString(),
      ratingCount: p._count.ratings,
      avgScore,
      likeCount: p._count.likes,
      hasLiked: p.likes.some((l) => l.userId === session.user.id),
    };
  });

  return NextResponse.json({ plans: data, subjects: LESSON_PLAN_SUBJECTS, gradeBands: LESSON_PLAN_GRADE_BANDS });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Ugyldig skjemadata" }, { status: 400 });
  }

  const parsed = lessonPlanSchema.safeParse({
    title: formData.get("title"),
    subject: formData.get("subject"),
    grade: formData.get("grade"),
    description: formData.get("description"),
    content: formData.get("content") || undefined,
    rightsConfirmed: formData.get("rightsConfirmed") === "true",
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldige opplysninger" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  let fileData: Uint8Array<ArrayBuffer> | undefined;
  let fileName: string | undefined;
  let fileType: string | undefined;
  let fileSize: number | undefined;

  if (file instanceof File && file.size > 0) {
    if (file.size > LESSON_PLAN_MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Filen er for stor (maks 10 MB)" }, { status: 400 });
    }
    if (!LESSON_PLAN_ALLOWED_FILE_TYPES.includes(file.type as (typeof LESSON_PLAN_ALLOWED_FILE_TYPES)[number])) {
      return NextResponse.json(
        { error: "Filtypen støttes ikke. Bruk PDF, Word, PowerPoint eller bilde." },
        { status: 400 }
      );
    }
    fileData = Buffer.from(await file.arrayBuffer());
    fileName = file.name;
    fileType = file.type;
    fileSize = file.size;
  }

  const plan = await prisma.lessonPlan.create({
    data: {
      ...parsed.data,
      fileData,
      fileName,
      fileType,
      fileSize,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ plan: { id: plan.id } });
}
