import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, mfaCode } = body;

    // Validate required fields
    if (!username || !password || !mfaCode) {
      return NextResponse.json(
        { error: "Username, password, and verification code are required" },
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
        phoneNumber: string;
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
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 401 }
      );
    }

    const client = generateClient();

    // Find admin user by username
    const adminResult = await client.graphql({
      query: `
        query GetAdminUser($username: String!) {
          listAdminUsers(filter: {
            username: { eq: $username }
          }) {
            items {
              id
              username
              password
              email
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
        username: username,
      },
    });

    const admins = (adminResult as { data: { listAdminUsers: { items: Array<{ 
      id: string; 
      username: string; 
      password: string; 
      email: string;
      firstName: string;
      lastName: string;
      role: string; 
      status: string; 
      lastLoginAt: string;
    }> } } }).data.listAdminUsers.items;

    if (admins.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const admin = admins[0];

    // Check if admin is active
    if (admin.status !== "active") {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login time
    await client.graphql({
      query: `
        mutation UpdateAdminUser($input: UpdateAdminUserInput!) {
          updateAdminUser(input: $input) {
            id
            lastLoginAt
          }
        }
      `,
      variables: {
        input: {
          id: admin.id,
          lastLoginAt: new Date().toISOString(),
        },
      },
    });

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

    return response;
  } catch (error) {
    console.error("MFA verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
} 