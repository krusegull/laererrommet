import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar userName={session.user.name ?? "Lærer"} unreadCount={unreadCount} />
      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <Sidebar />
        <main className="flex-1 px-4 pb-20 pt-6 sm:px-6 md:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
