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
          Praktisk veiledning om KI-bruk i skolen, basert på Oslo kommunes retningslinjer,
          Udirs rammeverk for lærerens profesjonsfaglige digitale kompetanse og Udirs
          veiledning om kunstig intelligens i skolen.
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/50">
          <a
            href="https://www.oslo.kommune.no/skole-og-utdanning/digitale-verktoy-osloskolen/kunstig-intelligens-ki-i-osloskolen/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-primary"
          >
            Oslo kommunes retningslinjer ↗
          </a>
          <a
            href="https://aktuelt.osloskolen.no/larerik-bruk-av-laringsteknologi/digital-skolehverdag/kunstig-intelligens-ki-i-osloskolen/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-primary"
          >
            Osloskolens retningslinjer ↗
          </a>
          <a
            href="https://www.udir.no/kvalitet-og-kompetanse/digitalisering-skole/rammeverk-larerens-profesjonsfaglige-digitale-komp/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-primary"
          >
            Udirs PfDK-rammeverk ↗
          </a>
          <a
            href="https://www.udir.no/kvalitet-og-kompetanse/digitalisering-skole/kunstig-intelligens-i-skolen/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-primary"
          >
            Udir: KI i skolen ↗
          </a>
          <a
            href="https://ki.osloskolen.no"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-primary"
          >
            Osloskolens KI-chatbot ↗
          </a>
        </div>
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
