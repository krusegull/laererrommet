export interface SkalaEntry {
  label: string;
  minScore: number;
}

export interface Kriterium {
  id: string;
  name: string;
  description?: string;
  weight: number;
  ekstraBra?: string;
}
