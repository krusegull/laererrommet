import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileView } from "@/components/ProfileView";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (id === session!.user.id) {
    redirect("/profil");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !user.isPublic) notFound();

  const [logCount, lessonPlanCount] = await Promise.all([
    prisma.feedbackLog.count({ where: { student: { userId: id } } }),
    prisma.lessonPlan.count({ where: { userId: id } }),
  ]);

  return (
    <ProfileView
      isOwnProfile={false}
      profile={{
        id: user.id,
        name: user.name,
        school: user.school,
        subject: user.subject,
        grade: user.grade,
        bio: user.bio,
        logCount,
        lessonPlanCount,
      }}
    />
  );
}
