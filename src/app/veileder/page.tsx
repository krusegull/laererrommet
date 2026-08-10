import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/Header";
import { VeilederChat } from "@/components/VeilederChat";

export default async function VeilederPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name ?? "";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header userName={userName} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
        <h1 className="text-2xl font-semibold text-foreground">KI-veilederen</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Spør om hva som er lov når det gjelder KI i undervisningen. Del aldri
          personopplysninger om elever i chatten.
        </p>
        <VeilederChat />
      </main>
    </div>
  );
}
