import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";
import bcrypt from "bcryptjs";

interface LoginData {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password }: LoginData = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const client = generateClient();

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
              lastLoginAt
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
      lastLoginAt: string; 
    }> } } }).data.listBusinessUsers.items;

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get business information
    const businessResult = await client.graphql({
      query: `
        query GetBusiness($id: String!) {
          getBusiness(id: $id) {
            id
            name
            phone
            email
            zipCode
            category
            status
            logo
            address
            city
            state
            website
            socialMedia
            businessHours
            description
            photos
            primaryContactEmail
            primaryContactPhone
            createdAt
            updatedAt
            approvedAt
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
      phone: string; 
      email: string; 
      zipCode: string; 
      category: string; 
      status: string; 
      logo: string; 
      address: string; 
      city: string; 
      state: string; 
      website: string; 
      socialMedia: string; 
      businessHours: string; 
      description: string; 
      photos: string; 
      primaryContactEmail: string; 
      primaryContactPhone: string; 
      createdAt: string; 
      updatedAt: string; 
      approvedAt: string; 
    } } }).data.getBusiness;

    // Check if business is approved
    if (business.status !== "approved") {
      return NextResponse.json(
        { error: "Business is not yet approved. Please wait for approval." },
        { status: 403 }
      );
    }

    // Update last login time
    await client.graphql({
      query: `
        mutation UpdateBusinessUser($input: UpdateBusinessUserInput!) {
          updateBusinessUser(input: $input) {
            id
            lastLoginAt
          }
        }
      `,
      variables: {
        input: {
          id: user.id,
          lastLoginAt: new Date().toISOString(),
        },
      },
    });

    // Return user and business data (without password)
    return NextResponse.json(
      { 
        success: true, 
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
        business: business
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during business login:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
} 