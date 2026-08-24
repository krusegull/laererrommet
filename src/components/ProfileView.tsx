import Link from "next/link";
import { School, BookOpen, GraduationCap, NotebookPen, Library, Settings, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface ProfileData {
  id: string;
  name: string;
  school: string | null;
  subject: string | null;
  grade: string | null;
  bio: string | null;
  logCount: number;
  lessonPlanCount: number;
}

export function ProfileView({ profile, isOwnProfile }: { profile: ProfileData; isOwnProfile: boolean }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Card>
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar name={profile.name} size="lg" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">{profile.name}</h1>
            {(profile.subject || profile.grade || profile.school) && (
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-foreground/60">
                {profile.subject && (
                  <span className="inline-flex items-center gap-1">
                    <BookOpen size={14} /> {profile.subject}
                  </span>
                )}
                {profile.grade && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap size={14} /> {profile.grade}
                  </span>
                )}
                {profile.school && (
                  <span className="inline-flex items-center gap-1">
                    <School size={14} /> {profile.school}
                  </span>
                )}
              </div>
            )}
          </div>
          {profile.bio && <p className="max-w-sm text-sm text-foreground/70">{profile.bio}</p>}

          {isOwnProfile ? (
            <Link href="/innstillinger">
              <Button variant="secondary" size="sm">
                <Settings size={16} /> Rediger profil
              </Button>
            </Link>
          ) : (
            <Link href={`/meldinger/${profile.id}`}>
              <Button size="sm">
                <MessageCircle size={16} /> Send melding
              </Button>
            </Link>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
          <NotebookPen size={20} className="mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{profile.logCount}</p>
          <p className="text-sm text-foreground/60">Tilbakemeldingslogger</p>
        </Card>
        <Card className="text-center">
          <Library size={20} className="mx-auto mb-2 text-secondary" />
          <p className="text-2xl font-bold text-foreground">{profile.lessonPlanCount}</p>
          <p className="text-sm text-foreground/60">Opplegg delt</p>
        </Card>
      </div>
    </div>
  );
}
