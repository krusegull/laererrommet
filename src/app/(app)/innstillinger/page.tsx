import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InnstillingerClient } from "./InnstillingerClient";

export default async function InnstillingerPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Innstillinger</h1>
        <p className="mt-1 text-foreground/60">Administrer profilen og kontoen din.</p>
      </div>

      <InnstillingerClient
        user={{
          name: user.name,
          email: user.email,
          school: user.school,
          subject: user.subject,
          grade: user.grade,
          bio: user.bio,
          isPublic: user.isPublic,
          darkMode: user.darkMode,
          notifyChat: user.notifyChat,
          notifyLikes: user.notifyLikes,
          notifyCalendar: user.notifyCalendar,
          notifyKI: user.notifyKI,
          notifyEmail: user.notifyEmail,
        }}
      />
    </div>
  );
}
