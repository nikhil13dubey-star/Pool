import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: Awaited<ReturnType<typeof auth>> }) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;

  // Redirect authenticated users away from sign-in
  if (isLoggedIn && pathname.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect unauthenticated users to sign-in (protect app routes)
  const isAppRoute =
    !pathname.startsWith("/sign-in") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/invite") &&
    pathname !== "/favicon.ico";

  if (!isLoggedIn && isAppRoute) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
