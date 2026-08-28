import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TerminlisteClient } from "./TerminlisteClient";

export default function TerminlistePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/kalender"
          className="inline-flex items-center gap-1 text-sm text-foreground/50 hover:text-foreground"
        >
          <ArrowLeft size={14} /> Tilbake til kalenderen
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Terminliste</h1>
        <p className="mt-1 text-foreground/60">
          Felles kalender for viktige datoer per trinn — synlig for alle lærere.
        </p>
      </div>
      <TerminlisteClient />
    </div>
  );
}
