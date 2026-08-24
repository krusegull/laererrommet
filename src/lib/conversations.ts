import { prisma } from "@/lib/prisma";

export interface ConversationSummary {
  userId: string;
  name: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

/**
 * Bygger en samtaleliste for en bruker basert på DirectMessage — det finnes
 * ingen egen Conversation-tabell, så "samtalen" er definert av hvem den andre
 * parten er. Grupperer i minnet siden dette er lavt volum per lærer.
 */
export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const messages = await prisma.directMessage.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
  });

  const byUser = new Map<string, ConversationSummary>();

  for (const message of messages) {
    const other = message.senderId === userId ? message.receiver : message.sender;
    const existing = byUser.get(other.id);
    const isUnreadForMe = message.receiverId === userId && !message.read;

    if (!existing) {
      byUser.set(other.id, {
        userId: other.id,
        name: other.name,
        lastMessage: message.content,
        lastMessageAt: message.createdAt.toISOString(),
        unreadCount: isUnreadForMe ? 1 : 0,
      });
    } else if (isUnreadForMe) {
      existing.unreadCount += 1;
    }
  }

  return Array.from(byUser.values()).sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}
