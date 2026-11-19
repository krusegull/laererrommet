import type { Kriterium, SkalaEntry } from "@/lib/vurdering/types";

export interface MalSummary {
  id: string;
  name: string;
  description: string | null;
  kriterieCount: number;
}

export interface MalDetail {
  id: string;
  name: string;
  description: string | null;
  skala: SkalaEntry[];
  kriterier: Kriterium[];
  updatedAt: string;
}
