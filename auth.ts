import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/server/db";

const isDev = process.env.NODE_ENV === "development";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY ?? "resend-placeholder",
      from: process.env.RESEND_FROM ?? "Pool <noreply@pool.app>",
      // In dev: skip email, just print the magic link to the terminal
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
    verifyRequest: "/sign-in/verify",
    error: "/sign-in",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
