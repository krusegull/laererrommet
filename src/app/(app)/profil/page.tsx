import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileView } from "@/components/ProfileView";

export default async function OwnProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [user, logCount, lessonPlanCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.feedbackLog.count({ where: { student: { userId } } }),
    prisma.lessonPlan.count({ where: { userId } }),
  ]);

  if (!user) return null;

  return (
    <ProfileView
      isOwnProfile
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
