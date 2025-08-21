import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";

interface SignupData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  status?: string;
  createdAt?: string;
}

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const client = generateClient({ authMode: "apiKey" });

    // Check if signup already exists with this email
    const existingSignup = await client.graphql({
      query: `
        query GetSignupByEmail($email: String!) {
          listSignups(filter: {
            email: { eq: $email }
          }) {
            items {
              id
              email
              status
              createdAt
            }
          }
        }
      `,
      variables: {
        email: email,
      },
    });

    const signups = (existingSignup as { data: { listSignups: { items: Array<{ id: string; email: string; status: string; createdAt: string }> } } }).data.listSignups.items;
    
    if (signups.length > 0) {
      const existing = signups[0];
      return NextResponse.json(
        { 
          error: "An account with this email already exists. Please use a different email or sign in.",
          existingSignup: {
            id: existing.id,
            status: existing.status,
            createdAt: existing.createdAt
          }
        },
        { status: 409 }
      );
    }

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
        data: (result as { data: { createSignup: SignupData } }).data.createSignup 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating signup:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    // Check if it's a unique constraint error
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please use a different email or sign in." },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to submit signup" },
      { status: 500 }
    );
  }
} 