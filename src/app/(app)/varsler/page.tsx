import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VarslerClient } from "./VarslerClient";

export default async function VarslerPage() {
  const session = await getServerSession(authOptions);
  const notifications = await prisma.notification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Varsler</h1>
        <p className="mt-1 text-foreground/60">Alt som har skjedd i Lærerrommet.</p>
      </div>

      <VarslerClient
        initialNotifications={notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.read,
          link: n.link,
          createdAt: n.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
