export type StudentStatus = "positive" | "neutral" | "negative";

export function computeStudentStatus(logs: { hasProgress: boolean }[]): StudentStatus {
  if (logs.length === 0) return "neutral";
  return logs[0].hasProgress ? "positive" : "negative";
}

export const STATUS_LABEL: Record<StudentStatus, string> = {
  positive: "Viser fremgang",
  neutral: "Ingen logger ennå",
  negative: "Trenger oppfølging",
};
