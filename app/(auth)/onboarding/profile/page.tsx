import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";
import { redirect } from "next/navigation";
import { ProfileSetupClient } from "./profile-setup-client";

export default async function OnboardingProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/sign-in");

  // Returning user who already completed onboarding
  if (user.displayName !== "") redirect("/");

  return <ProfileSetupClient email={user.email ?? ""} />;
}
