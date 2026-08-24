import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { directMessageSchema } from "@/lib/validations";
import { getConversations } from "@/lib/conversations";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const conversations = await getConversations(session.user.id);
  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = directMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ugyldig melding" },
      { status: 400 }
    );
  }

  // Senderen er ALLTID den innloggede brukeren — aldri fra klienten.
  const senderId = session.user.id;
  const { receiverId, content } = parsed.data;

  if (receiverId === senderId) {
    return NextResponse.json({ error: "Du kan ikke sende melding til deg selv" }, { status: 400 });
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    return NextResponse.json({ error: "Fant ikke mottakeren" }, { status: 404 });
  }

  const message = await prisma.directMessage.create({
    data: { senderId, receiverId, content },
  });

  if (receiver.notifyChat) {
    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    await createNotification(
      receiverId,
      "chat",
      "Ny melding",
      `${sender?.name ?? "Noen"} sendte deg en melding.`,
      `/meldinger/${senderId}`
    );
  }

  return NextResponse.json({ message });
}
