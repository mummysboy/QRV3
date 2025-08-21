import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("🔍 Testing login with:", { email, password: password ? "***" : "undefined" });

    const client = generateClient({ authMode: "apiKey" });

    // Find user by email
    const userResult = await client.graphql({
      query: `
        query GetBusinessUser($email: String!) {
          listBusinessUsers(filter: {
            email: { eq: $email }
          }) {
            items {
              id
              businessId
              email
              password
              firstName
              lastName
              role
              status
            }
          }
        }
      `,
      variables: {
        email: email,
      },
    });

    const users = (userResult as { data: { listBusinessUsers: { items: Array<{ 
      id: string; 
      businessId: string; 
      email: string; 
      password: string; 
      firstName: string; 
      lastName: string; 
      role: string; 
      status: string; 
    }> } } }).data.listBusinessUsers.items;

    console.log("📋 Found users:", users.length);

    if (users.length === 0) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 401 }
      );
    }

    const user = users[0];
    console.log("👤 User found:", { 
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
    console.log("🔐 Verifying password...");
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("✅ Password valid:", isValidPassword);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Get business information
    console.log("🏢 Getting business info...");
    const businessResult = await client.graphql({
      query: `
        query GetBusiness($id: String!) {
          getBusiness(id: $id) {
            id
            name
            status
          }
        }
      `,
      variables: {
        id: user.businessId,
      },
    });

    const business = (businessResult as { data: { getBusiness: { 
      id: string; 
      name: string; 
      status: string; 
    } | null } }).data.getBusiness;

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    console.log("🏢 Business found:", { 
      id: business.id, 
      name: business.name, 
      status: business.status 
    });

    // Check if business is approved
    if (business.status !== "approved") {
      return NextResponse.json(
        { error: "Business is not yet approved" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Login test successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        business: {
          id: business.id,
          name: business.name,
          status: business.status,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error during test login:", error);
    return NextResponse.json(
      { 
        error: "Login test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
} 