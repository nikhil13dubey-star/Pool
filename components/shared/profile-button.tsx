import Link from "next/link";
import { getCurrentUser } from "@/lib/server/current-user";
import { Avatar } from "@/components/ui/avatar";

// Account/profile entry point — a ring'd avatar, top-right on every tab screen.
// (Replaces the old Profile tab; an avatar top-right is the universal "account" affordance.)
export async function ProfileButton() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <Link
      href="/profile"
      aria-label="Your profile"
      style={{ display: "flex", flexShrink: 0 }}
    >
      <Avatar name={user.displayName} hue={user.avatarColor} size={38} ring />
    </Link>
  );
}
