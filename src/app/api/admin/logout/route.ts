import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("🔓 Admin logout requested");

    const response = NextResponse.json(
      { 
        success: true,
        message: "Admin logged out successfully"
      },
      { status: 200 }
    );

    // Clear the admin token cookie
    response.cookies.set('adminToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    console.log("✅ Admin logout successful");

    return response;
  } catch (error) {
    console.error("❌ Admin logout error:", error);
    return NextResponse.json(
      { 
        error: "Logout failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}