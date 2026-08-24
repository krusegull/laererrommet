import type { FeedbackLog } from "@/generated/prisma/client";

/**
 * Formaterer læreres egne notater om en elev til KI-vennlig tekst.
 * VIKTIG: Elevens navn/merkelapp (Student.label) sendes ALDRI hit —
 * kun læreren sine egne, allerede anonymiserte notater om oppgave,
 * styrke og utviklingsområde.
 */
export function formatLogsForAI(logs: FeedbackLog[]): string {
  if (logs.length === 0) {
    return "Ingen tidligere tilbakemeldinger er registrert for denne eleven ennå.";
  }

  return logs
    .map((log, i) => {
      const date = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" }).format(
        log.createdAt
      );
      return `Logg ${i + 1} (${date}):
Oppgave: ${log.task}
Det som var bra: ${log.positive}
Utviklingsområde: ${log.improve}
Viste fremgang siden sist: ${log.hasProgress ? "Ja" : "Nei"}`;
    })
    .join("\n\n");
}
