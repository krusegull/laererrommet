import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, CLAUDE_MODEL, VEILEDER_SYSTEM_PROMPT } from "@/lib/anthropic";

const chatSchema = z.object({
  message: z.string().trim().min(1).max(4000),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = chatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig melding" }, { status: 400 });
  }

  const { message } = parsed.data;
  const userId = session.user.id;

  const history = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  await prisma.chatMessage.create({
    data: { userId, role: "user", content: message },
  });

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: VEILEDER_SYSTEM_PROMPT,
      messages: [
        ...history.map((entry) => ({
          role: entry.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: entry.content,
        })),
        { role: "user" as const, content: message },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const reply = textBlock && textBlock.type === "text" ? textBlock.text : "";

    await prisma.chatMessage.create({
      data: { userId, role: "assistant", content: reply },
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Feil ved kall til KI-tjenesten:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente svar fra KI-veilederen. Prøv igjen." },
      { status: 502 }
    );
  }
}
