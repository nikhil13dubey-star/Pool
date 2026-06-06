import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/server/db";
import { SESSION_COOKIE, verifySession } from "@/lib/server/session";

// Reads the signed session cookie and returns the current user, or null.
// cache() dedupes within a single request render.
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const userId = verifySession(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user && !user.isGhost ? user : null;
});
