import { PoengImporterClient } from "./PoengImporterClient";

export default function PoengImporterPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Importer poeng fra konkurranse</h1>
        <p className="mt-1 text-foreground/60">
          Koble deltakerne til elevene dine, se over poengene og lagre dem under «Poeng per fag» på hver
          elevs profil.
        </p>
      </div>
      <PoengImporterClient />
    </div>
  );
}
