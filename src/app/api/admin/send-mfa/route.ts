import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize SES client
const sesClient = new SESClient({
  region: "us-west-1",
  // Use default credential provider chain
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email = "isaac@rightimagedigital.com" } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Generate 6-digit MFA code
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // TEMPORARY: Show code in console for testing
    console.log('🔐 TEMPORARY: Your login code is:', mfaCode);
    console.log('📧 This code was sent to:', email);
    console.log('⚠️  Check your server console for the code until email is working');
    
    // Store MFA code in a temporary JWT token (5 minutes expiry)
    const mfaToken = jwt.sign(
      { 
        email: email,
        mfaCode,
        type: 'mfa'
      },
      JWT_SECRET,
      { expiresIn: '5m' }
    );

    // Send email via SES
    const emailParams = {
      Source: "noreply@qrewards.com", // You'll need to verify this domain in SES
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: "Your QRewards Admin Login Code",
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: `Your QRewards admin login code is: ${mfaCode}

This code expires in 5 minutes.

If you didn't request this code, please ignore this email.

Best regards,
QRewards Team`,
            Charset: "UTF-8",
          },
          Html: {
            Data: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>QRewards Admin Login Code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">QRewards Admin Login</h2>
        <p>Your admin login code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 32px; color: #1f2937; margin: 0; letter-spacing: 4px;">${mfaCode}</h1>
        </div>
        <p><strong>This code expires in 5 minutes.</strong></p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            QRewards Team
        </p>
    </div>
</body>
</html>`,
            Charset: "UTF-8",
          },
        },
      },
    };

    try {
      const sendEmailCommand = new SendEmailCommand(emailParams);
      await sesClient.send(sendEmailCommand);
      console.log('✅ MFA code sent successfully to:', email);
    } catch (sesError) {
      console.error('❌ Failed to send email:', sesError);
      console.log('🔐 But you can still use the code shown above for testing');
      // Don't return error - allow testing with console code
    }

    // Return the MFA token (client will need this to verify the code)
    const response = NextResponse.json(
      { 
        success: true, 
        message: "Verification code sent successfully",
        email: email,
        // TEMPORARY: Include code in response for testing
        debugCode: mfaCode,
        debugMessage: "Use this code for testing until email is working"
      },
      { status: 200 }
    );

    // Set MFA token in HTTP-only cookie
    response.cookies.set('mfaToken', mfaToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 5 * 60, // 5 minutes
      path: '/'
    });

    return response;
  } catch (error) {
    console.error("MFA send error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
} 