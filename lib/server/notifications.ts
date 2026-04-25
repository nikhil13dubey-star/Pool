import { prisma } from "./db";
import type { NotificationType, Prisma } from "@prisma/client";

export async function emitNotification(
  userIds: string[],
  type: NotificationType,
  payload: Record<string, unknown>,
) {
  if (userIds.length === 0) return;

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type,
      payload: payload as Prisma.InputJsonValue,
    })),
  });
}
