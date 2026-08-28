export interface SettingsUser {
  name: string;
  email: string;
  school: string | null;
  subject: string | null;
  grade: string | null;
  bio: string | null;
  isPublic: boolean;
  darkMode: boolean;
  notifyChat: boolean;
  notifyLikes: boolean;
  notifyCalendar: boolean;
  notifyKI: boolean;
  notifyEmail: boolean;
  notifyFridayDigest: boolean;
}
