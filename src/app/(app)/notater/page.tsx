import { EgneNotaterClient } from "./EgneNotaterClient";

export default function EgneNotaterPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Egne notater</h1>
        <p className="mt-1 text-foreground/60">Personlige notater og huskelister, uke for uke.</p>
      </div>
      <EgneNotaterClient />
    </div>
  );
}
