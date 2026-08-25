import { NyttOppleggClient } from "./NyttOppleggClient";

export default function NyttOppleggPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Del et undervisningsopplegg</h1>
        <p className="mt-1 text-foreground/60">
          Skriv det ut, last opp en fil, eller begge deler — det som passer opplegget ditt.
        </p>
      </div>
      <NyttOppleggClient />
    </div>
  );
}
