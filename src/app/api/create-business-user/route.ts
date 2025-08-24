import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";

export async function POST(request: NextRequest) {
  try {
    console.log('👤 Creating business user...');
    
    const client = generateClient({ authMode: "apiKey" });
    
    // Business user data
    const userData = {
      id: "user-" + Date.now(), // Generate new user ID
      email: "isaac@rightimagedigital.com",
      password: "temporary-password-123", // Temporary password - you can change this later
      firstName: "Isaac",
      lastName: "Hirsch",
      role: "owner",
      status: "active",
      businessId: "cffb81b1-6d57-425a-9770-fe48e0e1b7bc", // Your existing business ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('🔧 Creating user with data:', userData);
    
    const userResult = await client.graphql({
      query: `
        mutation CreateBusinessUser($input: CreateBusinessUserInput!) {
          createBusinessUser(input: $input) {
            id
            email
            businessId
            status
            firstName
            lastName
          }
        }
      `,
      variables: {
        input: userData,
      },
    });
    
    console.log('✅ Business user created:', userResult);
    
    return NextResponse.json({
      success: true,
      message: "Business user created successfully!",
      user: (userResult as any).data.createBusinessUser,
    });
    
  } catch (error) {
    console.error('❌ User creation failed:', error);
    return NextResponse.json(
      { error: "User creation failed", details: error },
      { status: 500 }
    );
  }
}
