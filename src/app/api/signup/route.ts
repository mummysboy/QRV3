import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      businessName,
      businessAddress,
      businessCity,
      businessState,
      businessZip,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !businessName || !businessAddress || !businessCity || !businessState || !businessZip) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Create signup record
    const result = await client.graphql({
      query: `
        mutation CreateSignup($input: CreateSignupInput!) {
          createSignup(input: $input) {
            id
            firstName
            lastName
            email
            phone
            businessName
            businessAddress
            businessCity
            businessState
            businessZip
            status
            createdAt
          }
        }
      `,
      variables: {
        input: {
          firstName,
          lastName,
          email,
          phone: phone || "",
          businessName,
          businessAddress,
          businessCity,
          businessState,
          businessZip,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Signup submitted successfully",
        data: (result as any).data.createSignup 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating signup:", error);
    return NextResponse.json(
      { error: "Failed to submit signup" },
      { status: 500 }
    );
  }
} 