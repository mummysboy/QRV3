import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    // Get the admin token from cookies
    const adminToken = request.cookies.get('adminToken')?.value;

    if (!adminToken) {
      return NextResponse.json(
        { error: "No admin session found" },
        { status: 401 }
      );
    }

    // Verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(adminToken, JWT_SECRET) as any;
    } catch (jwtError) {
      console.error("❌ Invalid admin token:", jwtError);
      return NextResponse.json(
        { error: "Invalid admin session" },
        { status: 401 }
      );
    }

    // Check if token is for admin
    if (decoded.type !== 'admin') {
      return NextResponse.json(
        { error: "Invalid admin session type" },
        { status: 401 }
      );
    }

    const client = generateClient({ authMode: 'apiKey' });

    // Verify user still exists and is active
    const userResult = await client.graphql({
      query: `
        query GetAdminUser($id: ID!) {
          getAdminUser(id: $id) {
            id
            email
            firstName
            lastName
            role
            status
            lastLoginAt
          }
        }
      `,
      variables: {
        id: decoded.userId,
      },
    });

    const user = (userResult as { data: { getAdminUser: { 
      id: string; 
      email: string; 
      firstName: string; 
      lastName: string; 
      role: string; 
      status: string; 
      lastLoginAt: string; 
    } | null } }).data.getAdminUser;

    if (!user) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 401 }
      );
    }

    // Check if user is still active
    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Admin account is not active" },
        { status: 401 }
      );
    }

    console.log("✅ Admin session validated for:", user.email);

    return NextResponse.json(
      { 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Admin session validation error:", error);
    return NextResponse.json(
      { 
        error: "Session validation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}