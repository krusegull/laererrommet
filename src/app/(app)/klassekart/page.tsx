import { KlassekartClient } from "./KlassekartClient";

export default function KlassekartPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Klassekart</h1>
        <p className="mt-1 text-foreground/60">
          Design klasserommet, plasser pultene og la appen generere et gutt/jente-balansert klassekart.
        </p>
      </div>
      <KlassekartClient />
    </div>
  );
}
