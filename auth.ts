import NextAuth from "next-auth";
import ResendProvider from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Resend } from "resend";
import { prisma } from "@/lib/server/db";

function emailToColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
}

const isDev = process.env.NODE_ENV === "development";

const baseAdapter = PrismaAdapter(prisma);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: {
    ...baseAdapter,
    // Auth.js passes name/emailVerified/image which our schema doesn't have.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createUser: async (data: any) => {
      const email: string = data.email ?? "";
      const avatarColor = emailToColor(email);
      const user = await prisma.user.create({
        data: { email, displayName: "", avatarColor },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...user, email, emailVerified: null } as any;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 1 year — stay signed in
    updateAge: 24 * 60 * 60,
  },
  providers: [
    ResendProvider({
      apiKey: process.env.AUTH_RESEND_KEY ?? "resend-placeholder",
      from: process.env.RESEND_FROM ?? "Pool <noreply@pool.app>",
      async sendVerificationRequest({ identifier: email, url }) {
        if (isDev) {
          console.log("\n\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m");
          console.log("\x1b[33m  Pool magic link (dev only):\x1b[0m");
          console.log("\x1b[32m  " + url + "\x1b[0m");
          console.log("\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n");
          return;
        }

        // Rewrite the direct callback URL to a client-rendered landing page.
        // Email scanners / Gmail link-preview fetch URLs server-side (no JS),
        // so they won't execute the client-side redirect and won't consume the
        // one-time token before the user taps it.
        const urlObj = new URL(url);
        const token = urlObj.searchParams.get("token") ?? "";
        const callbackUrl = urlObj.searchParams.get("callbackUrl") ?? "/";
        const base = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? urlObj.origin;
        const landingUrl =
          `${base}/auth/verify` +
          `?token=${encodeURIComponent(token)}` +
          `&email=${encodeURIComponent(email)}` +
          `&callbackUrl=${encodeURIComponent(callbackUrl)}`;

        const client = new Resend(process.env.AUTH_RESEND_KEY!);
        const from = process.env.RESEND_FROM ?? "Pool <noreply@pool.app>";
        await client.emails.send({
          from,
          to: email,
          subject: "Sign in to Pool",
          html: signInEmailHtml(landingUrl, email),
        });
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in",
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

function signInEmailHtml(url: string, email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:48px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05));border:0.5px solid rgba(255,255,255,0.15);margin-bottom:12px;">
        <div style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.9);"></div>
      </div>
      <div style="font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.02em;">Pool</div>
    </div>

    <div style="background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.1);border-radius:20px;padding:32px;text-align:center;">
      <p style="color:rgba(255,255,255,0.55);font-size:14px;margin:0 0 4px;">Sign in as</p>
      <p style="color:#fff;font-size:16px;font-weight:500;margin:0 0 28px;word-break:break-all;">${email}</p>
      <a href="${url}"
         style="display:inline-block;background:#fff;color:#000;font-size:16px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:14px;letter-spacing:-0.01em;">
        Tap to sign in →
      </a>
      <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:24px 0 0;line-height:1.6;">
        This link expires in 15 minutes.<br>
        If you didn't request this, you can safely ignore it.
      </p>
    </div>

    <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center;margin-top:24px;">
      Pool · Split with friends
    </p>
  </div>
</body>
</html>`;
}
