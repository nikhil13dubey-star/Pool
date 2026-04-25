import { getCurrentUser } from "@/lib/server/auth-helpers";
import { ProfileClient } from "@/components/profile/profile-client";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  return <ProfileClient user={user} />;
}
