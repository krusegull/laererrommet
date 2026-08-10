import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/Header";

const comingSoonCards = [
  {
    title: "Undervisningsopplegg",
    description: "Ferdige opplegg og ressurser tilpasset dine fag og trinn.",
  },
  {
    title: "Vurdering og tilbakemelding",
    description: "Verktøy som hjelper deg gi rask og god tilbakemelding til elevene.",
  },
  {
    title: "Samarbeidsrom",
    description: "Del erfaringer og ressurser med kolleger på skolen din.",
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name ?? "";

  return (
    <div className="min-h-screen bg-background">
      <Header userName={userName} />

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-foreground">
          Velkommen, {userName}!
        </h1>
        <p className="mt-2 max-w-2xl text-foreground/70">
          Dette er ditt lærerrom — en faglig KI-plattform laget for lærere i Osloskolen.
          Utforsk KI-veilederen din for å få svar på spørsmål om KI-bruk i undervisningen.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/veileder"
            className="group flex flex-col justify-between rounded-2xl bg-primary p-6 text-white shadow-sm transition hover:bg-primary-dark"
          >
            <div>
              <h2 className="text-lg font-semibold">KI-veilederen</h2>
              <p className="mt-2 text-sm text-white/85">
                Spør om hva som er lov, og få praktiske tips til KI i klasserommet.
              </p>
            </div>
            <span className="mt-6 text-sm font-medium">Åpne veilederen →</span>
          </Link>

          {comingSoonCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col justify-between rounded-2xl bg-gray-100 p-6 text-gray-400 ring-1 ring-black/5"
            >
              <div>
                <h2 className="text-lg font-semibold">{card.title}</h2>
                <p className="mt-2 text-sm">{card.description}</p>
              </div>
              <span className="mt-6 inline-block w-fit rounded-full bg-gray-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                Kommer snart
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
