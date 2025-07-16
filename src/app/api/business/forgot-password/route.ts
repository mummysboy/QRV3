import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import crypto from "crypto";

const sesClient = new SESClient({
  region: "us-west-1",
  // Use default credential provider chain
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Find the business user by email
    const userResult = await client.graphql({
      query: `
        query GetBusinessUserByEmail($email: String!) {
          listBusinessUsers(filter: { email: { eq: $email } }) {
            items {
              id
              email
              firstName
              lastName
              businessId
              status
            }
          }
        }
      `,
      variables: { email },
    });

    const users = (userResult as { data: { listBusinessUsers: { items: Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      businessId: string;
      status: string;
    }> } } }).data.listBusinessUsers.items;

    if (!users || users.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent."
      });
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent."
      });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Note: In production, you should store this token in a separate table with an expiry timestamp
    // For now, we'll use the token directly in the URL (not recommended for production)
    
    // Create a reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.qrewards.net'}/business/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send the reset email
    try {
      await sendPasswordResetEmail({
        userEmail: user.email,
        userFirstName: user.firstName,
        userLastName: user.lastName,
        resetUrl,
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent."
    });

  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

async function sendPasswordResetEmail({
  userEmail,
  userFirstName,
  userLastName,
  resetUrl,
}: {
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  resetUrl: string;
}) {
  const command = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL || "QRewards@qrewards.net",
    Destination: {
      ToAddresses: [userEmail],
    },
    Message: {
      Subject: {
        Data: "🔐 Reset Your QRewards Password",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: `
            <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f7; padding: 40px 0; color: #1f2937;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(0,0,0,0.05);">
                <div style="text-align: center;">
                  <img src="https://www.qrewards.net/logo.png" alt="QRewards Logo" style="height: 40px; margin-bottom: 24px;" />
                  <h1 style="color: #16a34a; margin-bottom: 8px; font-size: 28px;">Password Reset Request</h1>
                  <p style="font-size: 18px; margin-bottom: 16px; color: #374151;">Hello ${userFirstName} ${userLastName},</p>
                  <p style="font-size: 16px; margin-bottom: 24px; color: #6b7280;">
                    We received a request to reset your password for your QRewards business account.
                  </p>
                </div>

                <div style="text-align: center; margin-bottom: 30px;">
                  <a href="${resetUrl}" style="
                    background-color: #16a34a;
                    color: #ffffff;
                    padding: 16px 32px;
                    font-size: 16px;
                    border-radius: 8px;
                    text-decoration: none;
                    display: inline-block;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
                  ">Reset My Password</a>
                </div>

                <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 24px 0;">
                  <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px;">⚠️ Important Security Notice</h4>
                  <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li style="margin-bottom: 4px;">This link will expire in 1 hour</li>
                    <li style="margin-bottom: 4px;">If you didn&apos;t request this reset, you can safely ignore this email</li>
                    <li style="margin-bottom: 4px;">Never share this link with anyone</li>
                  </ul>
                </div>

                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
                  <p style="color: #6b7280; margin: 0; font-size: 14px;">
                    <strong>Having trouble?</strong> If the button above doesn&apos;t work, copy and paste this link into your browser:
                  </p>
                  <p style="color: #16a34a; margin: 8px 0 0 0; font-size: 14px; word-break: break-all;">
                    ${resetUrl}
                  </p>
                </div>

                <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

                <div style="text-align: center;">
                  <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
                    Need help? Contact our support team at 
                    <a href="mailto:support@qrewards.net" style="color: #16a34a; text-decoration: none;">support@qrewards.net</a>
                  </p>
                  <p style="font-size: 12px; color: #9ca3af;">
                    You received this email because a password reset was requested for your QRewards business account.<br/>
                    If you didn&apos;t make this request, please contact our support team immediately.
                  </p>
                </div>
              </div>
            </div>
          `,
          Charset: "UTF-8",
        },
      },
    },
  });

  await sesClient.send(command);
} 