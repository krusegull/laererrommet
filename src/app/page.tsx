import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

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

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Den digitale kollegaen for norske lærere
        </h1>
        <p className="mt-5 max-w-xl text-lg text-foreground/70">
          Få trygg KI-veiledning basert på Oslo kommunes retningslinjer, hold orden på
          tilbakemeldinger til elevene dine, og få hjelp til å reflektere over egen praksis
          — samlet på ett sted, laget for hverdagen din som lærer.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/register">
            <Button size="lg">Opprett gratis konto</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              Jeg har allerede en konto
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-foreground/40">
        Lærerrommet — bygget for norske lærere
      </footer>
    </div>
  );
}
