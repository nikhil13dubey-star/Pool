import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/server/db";

function emailToColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 1 year — stay signed in
    updateAge: 24 * 60 * 60,
  },
  providers: [
    Credentials({
      credentials: { email: { type: "email" }, otp: { type: "text" } },
      async authorize(credentials) {
        const { email, otp } = credentials as { email?: string; otp?: string };
        if (!email || !otp) return null;
        if (otp.toLowerCase().trim() !== "mundungas") return null;
        const emailStr = email.toLowerCase().trim();
        let user = await prisma.user.findUnique({ where: { email: emailStr } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: emailStr,
              displayName: "",
              avatarColor: emailToColor(emailStr),
            },
          });
        }
        return { id: user.id, email: user.email! };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
