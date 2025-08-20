import { NextRequest, NextResponse } from "next/server";
import { generateConfiguredClient } from "../../../lib/amplify-client";
import bcrypt from "bcryptjs";
import { sendStatusChangeEmail } from "../../../lib/email-notifications";

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
  agreedToTerms: boolean;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Business signup: Starting business signup process...');
    
    // Initialize the configured client
    const client = generateConfiguredClient();
    console.log('🔧 Business signup: Client initialized successfully');
    
    const body = await request.json();
    console.log('🔧 Business signup: Request body received:', JSON.stringify(body, null, 2));
    
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
      agreedToTerms,
    }: BusinessSignupData = body;

    // Validate required fields
    if (!businessName || !businessPhone || !businessAddress || !businessCity || !businessState || !businessZipCode || !category || !email || !password || !firstName || !lastName) {
      console.log('🔧 Business signup: Missing required fields');
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      console.log('🔧 Business signup: Terms not agreed to');
      return NextResponse.json(
        { error: "You must agree to the Terms and Conditions to continue" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('🔧 Business signup: Invalid email format');
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate zip code format
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (!zipCodeRegex.test(businessZipCode)) {
      console.log('🔧 Business signup: Invalid zip code format');
      return NextResponse.json(
        { error: "Invalid zip code format" },
        { status: 400 }
      );
    }

    // Validate phone number format
    const cleanPhone = businessPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      console.log('🔧 Business signup: Invalid phone number format');
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    console.log('🔧 Business signup: Validation passed, checking existing data...');

    // Check if business already exists using GraphQL
    console.log('🔧 Business signup: Checking if business already exists...');
    const existingBusinessesResult = await client.graphql({
      query: `
        query ListBusinesses($name: String!, $zipCode: String!) {
          listBusinesses(filter: {
            name: { eq: $name }
            zipCode: { eq: $zipCode }
          }) {
            items {
              id
              name
              zipCode
            }
          }
        }
      `,
      variables: {
        name: businessName,
        zipCode: businessZipCode
      }
    });
    
    const existingBusinesses = (existingBusinessesResult as { data: { listBusinesses: { items: Array<{ id: string; name: string; zipCode: string }> } } }).data.listBusinesses.items;
    if (existingBusinesses.length > 0) {
      console.log('🔧 Business signup: Business already exists');
      return NextResponse.json(
        { error: "Business already exists" },
        { status: 409 }
      );
    }

    // Check if business user already exists
    console.log('🔧 Business signup: Checking if user already exists...');
    const existingUsersResult = await client.graphql({
      query: `
        query ListBusinessUsers($email: String!) {
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
        email: email
      }
    });
    
    const existingUsers = (existingUsersResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string }> } } }).data.listBusinessUsers.items;
    if (existingUsers.length > 0) {
      console.log('🔧 Business signup: User already exists');
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    console.log('🔧 Business signup: Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔧 Business signup: Password hashed successfully');

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
        console.error('🔧 Business signup: Failed to detect neighborhood, status:', detectRes.status);
        const errorText = await detectRes.text();
        console.error('🔧 Business signup: Neighborhood detection error:', errorText);
      }
    } catch (error) {
      console.error('🔧 Business signup: Error detecting neighborhood:', error);
    }

    // Create business with detected neighborhood using GraphQL
    console.log('🔧 Business signup: Creating business...');
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
            updatedAt
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
          neighborhood: neighborhood,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }
    });

    const business = (businessResult as { data: { createBusiness: { 
      id: string; 
      name: string; 
      phone: string; 
      email: string; 
      zipCode: string; 
      category: string; 
      status: string; 
      address: string; 
      city: string; 
      state: string; 
      neighborhood: string; 
      createdAt: string; 
      updatedAt: string; 
    } } }).data.createBusiness;

    if (!business) {
      throw new Error('Failed to create business - no data returned');
    }

    console.log('🔧 Business signup: Business created successfully:', business.id);

    // Create business user using GraphQL
    console.log('🔧 Business signup: Creating business user...');
    const userResult = await client.graphql({
      query: `
        mutation CreateBusinessUser($input: CreateBusinessUserInput!) {
          createBusinessUser(input: $input) {
            id
            businessId
            email
            password
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
        }
      }
    });

    const user = (userResult as { data: { createBusinessUser: { 
      id: string; 
      businessId: string; 
      email: string; 
      password: string; 
      firstName: string; 
      lastName: string; 
      role: string; 
      status: string; 
      createdAt: string; 
    } } }).data.createBusinessUser;

    if (!user) {
      throw new Error('Failed to create business user - no data returned');
    }

    console.log('🔧 Business signup: Business user created successfully:', user.id);

    console.log('🔧 Business signup: Successfully created business and user:', {
      businessId: business.id,
      businessName: business.name,
      neighborhood: business.neighborhood,
      userId: user.id,
      userEmail: user.email
    });

    // Send confirmation email to the user
    try {
      console.log('🔧 Business signup: Sending confirmation email...');
      await sendStatusChangeEmail({
        userEmail: user.email,
        businessName: business.name,
        userName: `${user.firstName} ${user.lastName}`,
        status: 'pending_approval',
      });
      console.log('🔧 Business signup: Confirmation email sent successfully');
    } catch (emailError) {
      console.error("Failed to send signup confirmation email:", emailError);
      // Don't fail the signup if email fails
    }

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
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('🔧 Business signup: Error message:', error.message);
      console.error('🔧 Business signup: Error stack:', error.stack);
    }
    
    // Check if it's a GraphQL error
    if (error && typeof error === 'object' && 'errors' in error) {
      console.error('🔧 Business signup: GraphQL errors:', (error as { errors: unknown }).errors);
    }
    
    return NextResponse.json(
      { error: "Failed to create business" },
      { status: 500 }
    );
  }
} 