import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('adminSession');
    
    if (!adminSession) {
      return NextResponse.json(
        { error: "No admin session found" },
        { status: 401 }
      );
    }

    // In production, you would validate the session token properly
    // For now, we'll just check if the cookie exists
    try {
      const decoded = Buffer.from(adminSession.value, 'base64').toString();
      const [username, timestamp] = decoded.split(':');
      
      // Check if session is not too old (24 hours)
      const sessionTime = parseInt(timestamp);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (now - sessionTime > maxAge) {
        return NextResponse.json(
          { error: "Session expired" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: { username, role: 'admin' }
      });
    } catch {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { error: "Session validation failed" },
      { status: 500 }
    );
  }
} 