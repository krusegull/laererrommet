import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatClient } from "./ChatClient";

export default async function VeilederPage() {
  const session = await getServerSession(authOptions);
  const messages = await prisma.chatMessage.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-2xl flex-col md:h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">KI-veilederen</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Praktisk veiledning om KI-bruk i skolen, basert på Oslo kommunes retningslinjer.
        </p>
      </div>
      <ChatClient
        initialMessages={messages.map((m) => ({
          id: m.id,
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }))}
      />
    </div>
  );
}
