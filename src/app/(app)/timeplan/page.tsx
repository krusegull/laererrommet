import { TimeplanClient } from "./TimeplanClient";

export default function TimeplanPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Timeplan</h1>
        <p className="mt-1 text-foreground/60">
          Den faste ukeplanen din, med fag og notater. Gjentas hver uke, bortsett fra i ferier.
        </p>
      </div>
      <TimeplanClient />
    </div>
  );
}
