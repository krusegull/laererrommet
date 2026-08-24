import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  Sparkles,
  NotebookPen,
  Users,
  BookOpen,
  CalendarDays,
  Rss,
  FlaskConical,
  ArrowRight,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const COMING_SOON = [
  { title: "Klasseprofil", description: "Samlet oversikt og notater for klassene dine.", icon: Users },
  { title: "Undervisningsbanken", description: "Del og finn undervisningsopplegg med andre lærere.", icon: BookOpen },
  { title: "Kalender", description: "Planlegg undervisning og hold styr på viktige datoer.", icon: CalendarDays },
  { title: "Faglig feed", description: "Nyheter og innsikt relevant for din undervisning.", icon: Rss },
  { title: "Forskning", description: "Forskningsbasert kunnskap oversatt til klasserommet.", icon: FlaskConical },
];

function formatNorwegianDate(date: Date) {
  const formatted = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return null;

  const firstName = user.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hei, {firstName}!</h1>
        <p className="mt-1 text-foreground/60">{formatNorwegianDate(new Date())}</p>
      </div>

      {!user.onboarded && (
        <Card className="border-primary/30 bg-primary/5">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-foreground">Fullfør profilen din</p>
              <p className="mt-1 text-sm text-foreground/70">
                Det tar bare et minutt, og hjelper oss å tilpasse Lærerrommet til deg.
              </p>
            </div>
            <Link href="/onboarding">
              <Button size="sm">
                Kom i gang
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Klar til bruk</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/veileder">
            <Card className="h-full transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-primary/10 text-primary">
                  <Sparkles size={20} />
                </span>
                <div>
                  <p className="font-semibold text-foreground">KI-veilederen</p>
                  <p className="mt-1 text-sm text-foreground/60">
                    Trygg, praktisk veiledning om KI-bruk i skolen — basert på Oslo kommunes
                    retningslinjer.
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/logg">
            <Card className="h-full transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-secondary/10 text-secondary">
                  <NotebookPen size={20} />
                </span>
                <div>
                  <p className="font-semibold text-foreground">Tilbakemeldingslogg</p>
                  <p className="mt-1 text-sm text-foreground/60">
                    Hold styr på styrker og utviklingsområder for elevene dine over tid.
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Kommer snart</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMING_SOON.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="opacity-60">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-background-subtle text-foreground/40">
                  <Icon size={20} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground/70">{title}</p>
                    <Badge variant="neutral">Kommer snart</Badge>
                  </div>
                  <p className="mt-1 text-sm text-foreground/50">{description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
