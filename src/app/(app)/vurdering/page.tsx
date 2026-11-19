import { VurderingClient } from "./VurderingClient";

export default function VurderingPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vurdering</h1>
        <p className="mt-1 text-foreground/60">
          Lag vurderingsmaler med vektede kriterier og en karakterskala du selv definerer - uavhengig av
          klassekart og elevlister.
        </p>
      </div>
      <VurderingClient />
    </div>
  );
}
