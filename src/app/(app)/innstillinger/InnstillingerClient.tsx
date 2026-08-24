import { ProfileSection } from "./ProfileSection";
import { NotificationsSection } from "./NotificationsSection";
import { PrivacySection } from "./PrivacySection";
import type { SettingsUser } from "./types";

export function InnstillingerClient({ user }: { user: SettingsUser }) {
  return (
    <div className="flex flex-col gap-8">
      <ProfileSection user={user} />
      <NotificationsSection user={user} />
      <PrivacySection user={user} />
    </div>
  );
}
