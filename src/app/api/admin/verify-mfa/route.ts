import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mfaCode } = body;

    // Validate required fields
    if (!mfaCode) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    // Get MFA token from cookie
    const mfaToken = request.cookies.get('mfaToken');
    if (!mfaToken) {
      return NextResponse.json(
        { error: "No verification session found. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify MFA token and extract stored data
    let mfaData;
    try {
      mfaData = jwt.verify(mfaToken.value, JWT_SECRET) as {
        email: string;
        mfaCode: string;
        type: string;
      };
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Verification session expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify MFA code
    if (mfaData.mfaCode !== mfaCode) {
      console.log('Code mismatch:', { expected: mfaData.mfaCode, received: mfaCode });
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 401 }
      );
    }

    // Create a simple admin session without database query
    const admin = {
      id: 'email-admin-' + Date.now(),
      username: 'admin',
      email: mfaData.email,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      lastLoginAt: new Date().toISOString(),
    };

    // Create JWT token for authenticated session
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username, 
        role: admin.role,
        email: admin.email,
        mfaVerified: true
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set secure HTTP-only cookie
    const response = NextResponse.json(
      { 
        success: true, 
        message: "Login successful",
        user: { 
          id: admin.id,
          username: admin.username, 
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role
        }
      },
      { status: 200 }
    );

    // Set admin token and clear MFA token
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    // Clear MFA token
    response.cookies.set('mfaToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    console.log('✅ Login successful for:', mfaData.email);

    return response;
  } catch (error) {
    console.error("MFA verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
} 