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

    const existingBusinesses = (existingBusiness as { data: { listBusinesses: { items: Array<{ id: string; name: string; zipCode: string; status: string }> } } }).data.listBusinesses.items;
    
    if (existingBusinesses.length > 0) {
      return NextResponse.json(
        { error: "Business already exists" },
        { status: 409 }
      );
    }

    // Check if business user already exists
    const existingUser = await client.graphql({
      query: `
        query GetBusinessUser($email: String!) {
          listBusinessUsers(filter: {
            email: { eq: $email }
          }) {
            items {
              id
              email
              businessId
            }
          }
        }
      `,
      variables: {
        email: email,
      },
    });

    const existingUsers = (existingUser as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; businessId: string }> } } }).data.listBusinessUsers.items;
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Detect neighborhood using AI
    let neighborhood = '';
    try {
      console.log('🔧 Business signup: Detecting neighborhood...');
      const detectRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/detect-neighborhood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName,
          address: `${businessAddress}, ${businessCity}, ${businessState} ${businessZipCode}`
        })
      });
      
      if (detectRes.ok) {
        const detectData = await detectRes.json();
        neighborhood = detectData.neighborhood || '';
        console.log('🔧 Business signup: Detected neighborhood:', neighborhood);
      } else {
        console.error('🔧 Business signup: Failed to detect neighborhood');
      }
    } catch (error) {
      console.error('🔧 Business signup: Error detecting neighborhood:', error);
    }

    // Create business with detected neighborhood
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
            address
            city
            state
            neighborhood
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
          neighborhood: neighborhood, // Include detected neighborhood
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    });

    const business = (businessResult as { data: { createBusiness: { id: string; name: string; phone: string; email: string; zipCode: string; category: string; status: string; address: string; city: string; state: string; neighborhood: string; createdAt: string } } }).data.createBusiness;

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

    console.log('🔧 Business signup: Successfully created business and user:', {
      businessId: business.id,
      businessName: business.name,
      neighborhood: business.neighborhood,
      userId: user.id,
      userEmail: user.email
    });

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
        status: business.status,
        neighborhood: business.neighborhood,
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      message: "Business signup successful. Please wait for admin approval.",
    });
  } catch (error) {
    console.error('🔧 Business signup: Error creating business:', error);
    return NextResponse.json(
      { error: "Failed to create business" },
      { status: 500 }
    );
  }
} 