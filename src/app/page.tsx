import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Sparkles, NotebookPen, UserRound } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const FEATURES = [
  {
    icon: Sparkles,
    title: "KI-veilederen",
    description:
      "Få trygg, praktisk veiledning om KI-bruk i skolen — basert på Oslo kommunes retningslinjer.",
  },
  {
    icon: NotebookPen,
    title: "Tilbakemeldingslogg",
    description:
      "Hold styr på styrker og utviklingsområder for elevene dine over tid, med KI-støtte til øvingsoppdrag og oppsummeringer.",
  },
  {
    icon: UserRound,
    title: "Faglig fellesskap",
    description:
      "Del erfaringer med kolleger, foreslå og stem på nye funksjoner, og reflekter over din egen praksis.",
  },
];

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-button bg-primary text-sm font-bold text-white">
              L
            </span>
            Lærerrommet
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Logg inn
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Kom i gang</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Det digitale hjemmet for lærere
          </h1>
          <p className="mt-5 max-w-xl text-lg text-foreground/70">
            KI-verktøy, tilbakemeldingslogg og faglig fellesskap — bygget for Osloskolen.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg">Kom i gang</Button>
            </Link>
            <a href="#funksjoner">
              <Button variant="secondary" size="lg">
                Les mer
              </Button>
            </a>
          </div>
        </section>

        <section id="funksjoner" className="border-t border-line bg-background-subtle py-16">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3 sm:px-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-button bg-primary/10 text-primary">
                  <Icon size={20} />
                </span>
                <h2 className="mt-4 font-semibold text-foreground">{title}</h2>
                <p className="mt-1 text-sm text-foreground/60">{description}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 text-center sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-button bg-primary text-xs font-bold text-white">
              L
            </span>
            Lærerrommet
          </div>
          <p className="text-xs text-foreground/40">
            Den digitale kollegaen for norske lærere.
          </p>
        </div>
      </footer>
    </div>
  );
}
