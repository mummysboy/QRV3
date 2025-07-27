import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";
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

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Find all users by email (user might have multiple businesses)
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

    // Find a user with a valid password (users might have empty passwords if they were added via add-business)
    const validUser = users.find(user => user.password && user.password.trim() !== '');
    
    if (!validUser) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (validUser.status !== "active") {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, validUser.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get all businesses for this user
    const businessIds = users.map(user => user.businessId);
    const businesses = [];
    
    for (const businessId of businessIds) {
      try {
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
            id: businessId,
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
        } | null } }).data.getBusiness;

        if (business) {
          businesses.push(business);
        }
      } catch (err) {
        console.error(`Error fetching business ${businessId}:`, err);
      }
    }

    // Find approved businesses
    const approvedBusinesses = businesses.filter(business => business.status === "approved");
    
    if (approvedBusinesses.length === 0) {
      return NextResponse.json(
        { error: "No approved businesses found. Please wait for approval." },
        { status: 403 }
      );
    }

    // Use the first approved business as the primary business for the session
    const primaryBusiness = approvedBusinesses[0];
    const primaryUser = users.find(user => user.businessId === primaryBusiness.id);

    if (!primaryUser) {
      return NextResponse.json(
        { error: "User not found for primary business" },
        { status: 404 }
      );
    }

    // Generate a JWT session token for the primary business user
    const payload = {
      sub: primaryUser.id,
      email: primaryUser.email,
      businessId: primaryBusiness.id,
      role: "business",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 days
    };
    const sessionToken = jwt.sign(payload, JWT_SECRET);

    // Update last login time for the primary user
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
          id: primaryUser.id,
          lastLoginAt: new Date().toISOString(),
        },
      },
    });

    // Return user data, primary business, and all businesses
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        sessionToken: sessionToken,
        user: {
          id: primaryUser.id,
          email: primaryUser.email,
          firstName: primaryUser.firstName,
          lastName: primaryUser.lastName,
          role: primaryUser.role,
          status: primaryUser.status,
        },
        business: primaryBusiness, // Primary business for backward compatibility
        allBusinesses: approvedBusinesses, // All approved businesses
        totalBusinesses: approvedBusinesses.length,
      },
      { status: 200 }
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
} 