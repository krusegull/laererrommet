import type { Grupper, LockEntry, PairHistory, Pod, PodSeats, RoomObject, StudentLite } from "@/lib/klassekart/types";

export interface ClassSummary {
  id: string;
  name: string;
  studentCount: number;
}

export interface ChartSummary {
  id: string;
  label: string;
  week: number | null;
  year: number | null;
  updatedAt: string;
}

export interface ClassDetail {
  id: string;
  name: string;
  students: StudentLite[];
  charts: ChartSummary[];
}

export interface ChartDetail {
  id: string;
  label: string;
  week: number | null;
  year: number | null;
  roomObjects: RoomObject[];
  podLayout: Pod[];
  pods: PodSeats;
  locks: LockEntry[];
  pairHistory: PairHistory;
  grupper: Grupper;
  updatedAt: string;
}

export type TabKey = "rom" | "pulter" | "elever" | "kart" | "grupper";
