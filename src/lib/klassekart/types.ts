export type Gender = "gutt" | "jente";

export interface StudentLite {
  id: string;
  name: string;
  gender: Gender;
}

export interface RoomObject {
  id: string;
  type: "dor" | "tavle" | "vindu" | "kateter" | "laerer" | "bokhylle" | "egen";
  label: string;
  x: number;
  y: number;
  /** Bredde/høyde i px. Udefinert bruker typens realistiske standardmål (se DEFAULT_DIMENSIONS). */
  w?: number;
  h?: number;
}

export interface Pod {
  id: number;
  size: number;
  x: number;
  y: number;
}

export interface LockEntry {
  studentId: string;
  podIndex: number;
  seatIndex: number;
}

/** Hvert pod-sete inneholder en elev-id, eller null hvis setet står tomt. */
export type PodSeats = (string | null)[][];

export type PairHistory = Record<string, number>;

export type Grupper = string[][];
