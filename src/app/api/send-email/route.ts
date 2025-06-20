// File: /src/app/api/send-email/route.ts

import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { to, url } = await req.json();

  if (!to || !url) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const { error } = await resend.emails.send({
      from: "QRewards <onboarding@resend.dev>",
      to,
      subject: "🎁 Your Reward is Ready – Open to Reveal!",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f7; padding: 40px 0; color: #1f2937;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(0,0,0,0.05);">
            <div style="text-align: center;">
              <img src="qrewards.net/logo.png" alt="QRewards Logo" style="height: 40px; margin-bottom: 24px;" />
              <h1 style="color: #16a34a; margin-bottom: 8px; font-size: 24px;">Congratulations!</h1>
              <p style="font-size: 16px; margin-bottom: 24px;">🎉 You've successfully claimed your reward.</p>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${url}" style="
                background-color: #16a34a;
                color: #ffffff;
                padding: 14px 28px;
                font-size: 16px;
                border-radius: 8px;
                text-decoration: none;
                display: inline-block;
                font-weight: 600;
              ">🎁 View My Reward</a>
            </div>

            <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              You received this email because you claimed a reward from <strong>QRewards</strong>.<br/>
              If this wasn’t you, you can safely ignore this message.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Unexpected error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
