import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/server/db";

function emailToColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
}

function emailToDisplayName(email: string): string {
  const local = email.split("@")[0] ?? "user";
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const isDev = process.env.NODE_ENV === "development";

const baseAdapter = PrismaAdapter(prisma);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: {
    ...baseAdapter,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createUser: async (data: any) => {
      const email: string = data.email ?? "";
      const displayName = emailToDisplayName(email) || "User";
      const avatarColor = emailToColor(email);
      return baseAdapter.createUser!({ ...data, displayName, avatarColor });
    },
  },
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY ?? "resend-placeholder",
      from: process.env.RESEND_FROM ?? "Pool <noreply@pool.app>",
      ...(isDev && {
        sendVerificationRequest({ url }) {
          console.log("\n\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m");
          console.log("\x1b[33m  Pool magic link (dev only):\x1b[0m");
          console.log("\x1b[32m  " + url + "\x1b[0m");
          console.log("\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n");
        },
      }),
    }),
  ],
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
