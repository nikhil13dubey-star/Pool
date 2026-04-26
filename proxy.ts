import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;

  if (isLoggedIn && pathname.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

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
