import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, businessId } = body;

    if (!email || !password || !businessId) {
      return NextResponse.json(
        { error: "Email, password, and businessId are required" },
        { status: 400 }
      );
    }

    console.log("🔍 Creating test user with:", { email, password: "***", businessId });

    const client = generateClient();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔐 Password hashed successfully");

    // Create the business user
    const createResult = await client.graphql({
      query: `
        mutation CreateBusinessUser($input: CreateBusinessUserInput!) {
          createBusinessUser(input: $input) {
            id
            businessId
            email
            firstName
            lastName
            role
            status
            createdAt
          }
        }
      `,
      variables: {
        input: {
          businessId: businessId,
          email: email,
          password: hashedPassword,
          firstName: "Test",
          lastName: "User",
          role: "owner",
          status: "active",
        },
      },
    });

    const newUser = (createResult as { data: { createBusinessUser: { 
      id: string; 
      businessId: string; 
      email: string; 
      firstName: string; 
      lastName: string; 
      role: string; 
      status: string; 
      createdAt: string; 
    } } }).data.createBusinessUser;

    console.log("✅ Test user created:", { id: newUser.id, email: newUser.email });

    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        status: newUser.status,
      },
      credentials: {
        email: email,
        password: password, // Return the plain password for testing
      }
    });
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
} 