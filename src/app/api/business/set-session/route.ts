import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { sessionToken } = await request.json();
    console.log('🔍 Set-Session API - Received request with sessionToken:', sessionToken ? 'present' : 'missing');
    if (!sessionToken) {
      console.log('🔍 Set-Session API - Missing session token, returning 400');
      return NextResponse.json({ error: "Missing session token" }, { status: 400 });
    }
    const response = NextResponse.json({ success: true }, { status: 200 });
    console.log('🔍 Set-Session API - Setting cookie with secure:', false);
    response.cookies.set('qrewards_session', sessionToken, {
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