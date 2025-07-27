import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, businessId } = await request.json();
    console.log('🔍 Set-Session API - Received request with sessionToken:', sessionToken ? 'present' : 'missing');
    console.log('🔍 Set-Session API - Business ID for switching:', businessId || 'not provided');
    
    if (!sessionToken) {
      console.log('🔍 Set-Session API - Missing session token, returning 400');
      return NextResponse.json({ error: "Missing session token" }, { status: 400 });
    }

    let finalSessionToken = sessionToken;

    // If businessId is provided, create a new session token for that business
    if (businessId) {
      try {
        // Decode the existing token to get user info
        const decoded = jwt.verify(sessionToken, JWT_SECRET) as {
          sub: string;
          email: string;
          businessId: string;
          role: string;
          iat: number;
          exp: number;
        };
        
        // Create a new token with the new business ID
        const newPayload = {
          sub: decoded.sub,
          email: decoded.email,
          businessId: businessId,
          role: decoded.role,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 days
        };
        
        finalSessionToken = jwt.sign(newPayload, JWT_SECRET);
        console.log('🔍 Set-Session API - Created new session token for business:', businessId);
      } catch (error) {
        console.error('🔍 Set-Session API - Error creating new session token:', error);
        return NextResponse.json({ error: "Invalid session token" }, { status: 400 });
      }
    }

    const response = NextResponse.json({ success: true }, { status: 200 });
    console.log('🔍 Set-Session API - Setting cookie with secure:', false);
    response.cookies.set('qrewards_session', finalSessionToken, {
      httpOnly: true,
      secure: false, // Temporarily disable for testing
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    console.log('🔍 Set-Session API - Cookie set successfully');
    return response;
  } catch (error) {
    console.error("Set session error:", error);
    return NextResponse.json({ error: "Failed to set session" }, { status: 500 });
  }
} 