import type { Grupper, LockEntry, PairHistory, Pod, PodSeats, RoomObject, StudentLite } from "@/lib/klassekart/types";

export interface ClassSummary {
  id: string;
  name: string;
  studentCount: number;
}

export interface ClassDetail {
  id: string;
  name: string;
  students: StudentLite[];
  roomObjects: RoomObject[];
  podLayout: Pod[];
  pods: PodSeats;
  locks: LockEntry[];
  pairHistory: PairHistory;
  grupper: Grupper;
  updatedAt: string | null;
}

export type TabKey = "rom" | "pulter" | "elever" | "kart" | "grupper";
