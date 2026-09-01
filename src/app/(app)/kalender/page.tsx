import Link from "next/link";
import { ListChecks } from "lucide-react";
import { KalenderClient } from "./KalenderClient";

export default function KalenderPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kalender</h1>
          <p className="mt-1 text-foreground/60">Planlegg undervisning og hold styr på viktige datoer.</p>
        </div>
        <Link
          href="/kalender/terminliste"
          className="inline-flex items-center gap-1.5 rounded-button border border-line px-3 py-2 text-sm font-medium text-foreground/70 hover:border-primary hover:text-primary"
        >
          <ListChecks size={16} /> Terminliste
        </Link>
      </div>
      <KalenderClient />
    </div>
  );
}
