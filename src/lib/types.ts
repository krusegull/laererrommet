export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}
