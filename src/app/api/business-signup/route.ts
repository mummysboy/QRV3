import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";
import bcrypt from "bcryptjs";

interface BusinessSignupData {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  category: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessName,
      businessPhone,
      businessAddress,
      businessCity,
      businessState,
      businessZipCode,
      category,
      email,
      password,
      firstName,
      lastName,
    }: BusinessSignupData = body;

    // Validate required fields
    if (!businessName || !businessPhone || !businessAddress || !businessCity || !businessState || !businessZipCode || !category || !email || !password || !firstName || !lastName) {
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

    // Validate zip code format
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (!zipCodeRegex.test(businessZipCode)) {
      return NextResponse.json(
        { error: "Invalid zip code format" },
        { status: 400 }
      );
    }

    // Validate phone number format
    const cleanPhone = businessPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Check if business already exists
    const existingBusiness = await client.graphql({
      query: `
        query GetBusiness($name: String!, $zipCode: String!) {
          listBusinesses(filter: {
            name: { eq: $name }
            zipCode: { eq: $zipCode }
          }) {
            items {
              id
              name
              zipCode
              status
            }
          }
        }
      `,
      variables: {
        name: businessName,
        zipCode: businessZipCode,
      },
    });

    const businesses = (existingBusiness as { data: { listBusinesses: { items: Array<{ id: string; name: string; zipCode: string; status: string }> } } }).data.listBusinesses.items;
    
    if (businesses.length > 0) {
      // Business exists - check if it's already claimed
      const existingBusiness = businesses[0];
      if (existingBusiness.status === "approved") {
        return NextResponse.json(
          { 
            error: "Business already exists and is claimed",
            businessExists: true,
            businessId: existingBusiness.id
          },
          { status: 409 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await client.graphql({
      query: `
        query GetBusinessUser($email: String!) {
          listBusinessUsers(filter: {
            email: { eq: $email }
          }) {
            items {
              id
              email
            }
          }
        }
      `,
      variables: {
        email: email,
      },
    });

    const users = (existingUser as { data: { listBusinessUsers: { items: Array<{ id: string; email: string }> } } }).data.listBusinessUsers.items;
    
    if (users.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create business (neighborhood will be detected when approved)
    const businessResult = await client.graphql({
      query: `
        mutation CreateBusiness($input: CreateBusinessInput!) {
          createBusiness(input: $input) {
            id
            name
            phone
            email
            zipCode
            category
            status
            createdAt
          }
        }
      `,
      variables: {
        input: {
          name: businessName,
          phone: businessPhone,
          email: email,
          zipCode: businessZipCode,
          category: category,
          status: "pending_approval",
          address: businessAddress,
          city: businessCity,
          state: businessState,
          // neighborhood will be set when approved
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    });

    const business = (businessResult as { data: { createBusiness: { id: string; name: string; phone: string; email: string; zipCode: string; category: string; status: string; createdAt: string } } }).data.createBusiness;

    // Create business user
    const userResult = await client.graphql({
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
          businessId: business.id,
          email: email,
          password: hashedPassword,
          firstName: firstName,
          lastName: lastName,
          role: "owner",
          status: "active",
          createdAt: new Date().toISOString(),
        },
      },
    });

    const user = (userResult as { data: { createBusinessUser: { id: string; businessId: string; email: string; firstName: string; lastName: string; role: string; status: string; createdAt: string } } }).data.createBusinessUser;

    return NextResponse.json(
      { 
        success: true, 
        message: "Business signup submitted successfully",
        data: {
          business: business,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          }
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating business signup:", error);
    return NextResponse.json(
      { error: "Failed to submit business signup" },
      { status: 500 }
    );
  }
} 