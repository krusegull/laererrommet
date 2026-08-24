export interface PrivateNoteItem {
  id: string;
  type: string;
  content: string;
  period: string | null;
  source: string | null;
  createdAt: string;
}
