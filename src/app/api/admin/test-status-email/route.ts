import { NextResponse } from "next/server";
import { sendStatusChangeEmail } from "../../../../lib/email-notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      email, 
      status, 
      businessName, 
      userName, 
      reason, 
      testEmail 
    } = body;

    if (!email || !status) {
      return NextResponse.json(
        { error: "Email and status are required" },
        { status: 400 }
      );
    }

    // Use test email if provided, otherwise use the original email
    const targetEmail = testEmail || email;

    console.log(`📧 Testing status email for ${status} to ${targetEmail}`);

    await sendStatusChangeEmail({
      userEmail: targetEmail,
      businessName: businessName || "Test Business",
      userName: userName || "Test User",
      status: status,
      reason: reason,
    });

    return NextResponse.json({
      success: true,
      message: `Status email for '${status}' sent successfully to ${targetEmail}`,
      email: targetEmail,
      status: status,
    });
  } catch (error) {
    console.error("Error sending test status email:", error);
    return NextResponse.json(
      { error: "Failed to send test status email" },
      { status: 500 }
    );
  }
} 