import { LaeringsportalenClient } from "./LaeringsportalenClient";

export default function LaeringsportalenPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Læringsportalen</h1>
        <p className="mt-1 text-foreground/60">
          Fag, temaer og konkurranser fra Læringsportalen. Velg en klasse for å starte konkurranser med
          den - temaene under er egne nettsider elevene kan utforske selv.
        </p>
      </div>
      <LaeringsportalenClient />
    </div>
  );
}
