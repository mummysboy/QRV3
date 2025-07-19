import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getAdminCredentials, updateAdminPassword } from '@/lib/admin-credentials';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All password fields are required" },
        { status: 400 }
      );
    }

    // Validate new password matches confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match" },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Get admin user from JWT token
    const adminToken = request.cookies.get('adminToken');
    if (!adminToken) {
      return NextResponse.json(
        { error: "No admin session found" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(adminToken.value, JWT_SECRET) as {
        id: string;
        username: string;
        role: string;
        email: string;
      };
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const credentials = getAdminCredentials();
    
    // Verify current password (compare with stored password)
    if (currentPassword !== credentials.password) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Update the password in memory
    updateAdminPassword(newPassword);
    
    // Create new JWT token
    const newToken = jwt.sign(
      { 
        id: 'admin-user', 
        username: 'admin', 
        role: 'admin',
        email: credentials.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set new secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('adminToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Password changed successfully! You can now login with your new password."
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Simple admin password change error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
} 