import { NextRequest, NextResponse } from "next/server";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize SNS client
const snsClient = new SNSClient({
  region: "us-west-1",
  // Use default credential provider chain
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    // Validate phone number
    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Format phone number to E.164 format
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = `+1${formattedPhone}`;
    } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
      formattedPhone = `+${formattedPhone}`;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    // Generate 6-digit MFA code
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store MFA code in a temporary JWT token (5 minutes expiry)
    const mfaToken = jwt.sign(
      { 
        phoneNumber: formattedPhone,
        mfaCode,
        type: 'mfa'
      },
      JWT_SECRET,
      { expiresIn: '5m' }
    );

    // Send SMS via SNS
    const message = `Your QRewards admin verification code is: ${mfaCode}. This code expires in 5 minutes.`;
    
    const publishCommand = new PublishCommand({
      Message: message,
      PhoneNumber: formattedPhone,
    });

    try {
      await snsClient.send(publishCommand);
      console.log('✅ MFA code sent successfully to:', formattedPhone);
    } catch (snsError) {
      console.error('❌ Failed to send SMS:', snsError);
      return NextResponse.json(
        { error: "Failed to send verification code. Please try again." },
        { status: 500 }
      );
    }

    // Return the MFA token (client will need this to verify the code)
    const response = NextResponse.json(
      { 
        success: true, 
        message: "Verification code sent successfully",
        phoneNumber: formattedPhone
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