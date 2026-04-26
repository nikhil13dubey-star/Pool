import { Resend } from "resend";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return Response.json({ error: "Email required" }, { status: 400 });

  const from = process.env.RESEND_FROM ?? "Pool <noreply@pool.app>";

  // In dev, skip actual send
  if (process.env.NODE_ENV === "development") {
    console.log(`[Pool OTP] Code for ${email}: mundungas`);
    return Response.json({ success: true });
  }

  const resend = new Resend(process.env.AUTH_RESEND_KEY!);
  await resend.emails.send({
    from,
    to: email,
    subject: "Your Pool sign-in code",
    html: `<div style="background:#0a0a0a;font-family:-apple-system,sans-serif;padding:48px 24px;max-width:480px;margin:0 auto;">
      <div style="background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.1);border-radius:20px;padding:32px;text-align:center;">
        <div style="font-size:14px;color:rgba(255,255,255,0.55);margin-bottom:12px;">Your sign-in code for Pool</div>
        <div style="font-size:32px;font-weight:700;letter-spacing:0.08em;color:#fff;margin-bottom:16px;">mundungas</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.35);">This code expires in 15 minutes. If you didn't request this, ignore this email.</div>
      </div>
    </div>`,
  });

  return Response.json({ success: true });
}
