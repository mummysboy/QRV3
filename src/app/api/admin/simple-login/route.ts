import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface LoginData {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password }: LoginData = body;

    console.log("🔍 Admin login attempt:", { email, password: password ? "***" : "undefined" });

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const client = generateClient({ authMode: 'apiKey' });

    // Find admin user by email
    const userResult = await client.graphql({
      query: `
        query GetAdminUser($email: String!) {
          listAdminUsers(filter: {
            email: { eq: $email }
          }) {
            items {
              id
              email
              password
              firstName
              lastName
              role
              status
              lastLoginAt
            }
          }
        }
      `,
      variables: {
        email: email,
      },
    });

    const users = (userResult as { data: { listAdminUsers: { items: Array<{ 
      id: string; 
      email: string; 
      password: string; 
      firstName: string; 
      lastName: string; 
      role: string; 
      status: string; 
      lastLoginAt: string; 
    }> } } }).data.listAdminUsers.items;

    console.log("📋 Found admin users:", users.length);

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = users[0];
    console.log("👤 Admin user found:", { 
      id: user.id, 
      email: user.email, 
      status: user.status,
      hasPassword: !!user.password 
    });

    // Check if user is active
    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 401 }
      );
    }

    // Verify password
    console.log("🔐 Verifying admin password...");
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("✅ Admin password valid:", isValidPassword);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create JWT token for admin session
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        type: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log("✅ Admin login successful for:", user.email);

    const response = NextResponse.json(
      { 
        success: true, 
        message: "Admin login successful",
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

    // Set JWT token in HTTP-only cookie
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return response;
  } catch (error) {
    console.error("❌ Admin login error:", error);
    return NextResponse.json(
      { 
        error: "Login failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}