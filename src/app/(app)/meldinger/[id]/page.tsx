import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/Avatar";
import { ConversationClient } from "./ConversationClient";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: otherUserId } = await params;
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  if (otherUserId === userId) notFound();

  const otherUser = await prisma.user.findUnique({ where: { id: otherUserId } });
  if (!otherUser) notFound();

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // Marker alle uleste meldinger FRA den andre parten som lest ved åpning.
  await prisma.directMessage.updateMany({
    where: { senderId: otherUserId, receiverId: userId, read: false },
    data: { read: true },
  });

  return (
    <div className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-2xl flex-col md:h-[calc(100vh-6rem)]">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/meldinger" className="text-foreground/50 hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <Avatar name={otherUser.name} size="sm" />
        <h1 className="font-semibold text-foreground">{otherUser.name}</h1>
      </div>

      <ConversationClient
        currentUserId={userId}
        otherUserId={otherUserId}
        initialMessages={messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
