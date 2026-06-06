import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/current-user";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    id: user.id,
    displayName: user.displayName,
    handle: user.handle,
    avatarColor: user.avatarColor,
    upiId: user.upiId,
  });
}
