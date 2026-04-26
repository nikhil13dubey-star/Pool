import { cache } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";
import { redirect } from "next/navigation";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) redirect("/sign-in");
  if (user.displayName === "") redirect("/onboarding/profile");

  return user;
});

export const getOptionalUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
});
