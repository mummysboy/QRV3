import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    const client = generateClient({ authMode: "apiKey" });

    // Get admin user from database
    const adminResult = await client.graphql({
      query: `
        query GetAdminUser($id: String!) {
          getAdminUser(id: $id) {
            id
            username
            password
            email
            firstName
            lastName
            role
            status
          }
        }
      `,
      variables: {
        id: decoded.id,
      },
    });

    const admin = (adminResult as { data: { getAdminUser: { 
      id: string; 
      username: string; 
      password: string; 
      email: string;
      firstName: string;
      lastName: string;
      role: string; 
      status: string; 
    } | null } }).data.getAdminUser;

    if (!admin) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }

    // Check if admin is active
    if (admin.status !== "active") {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 401 }
      );
    }

    // Verify current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, admin.password);
    if (!isValidCurrentPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await client.graphql({
      query: `
        mutation UpdateAdminUser($input: UpdateAdminUserInput!) {
          updateAdminUser(input: $input) {
            id
            username
            email
            firstName
            lastName
            role
            status
            updatedAt
          }
        }
      `,
      variables: {
        input: {
          id: admin.id,
          password: hashedNewPassword,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    // Create new JWT token with updated info
    const newToken = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username, 
        role: admin.role,
        email: admin.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set new secure HTTP-only cookie
    const response = NextResponse.json(
      { 
        success: true, 
        message: "Password changed successfully"
      },
      { status: 200 }
    );

    response.cookies.set('adminToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    return response;
  } catch (error) {
    console.error("Admin password change error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
} 