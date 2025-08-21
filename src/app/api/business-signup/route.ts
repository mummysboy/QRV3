import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
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
    
    // Initialize DynamoDB client
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });
    console.log('🔧 Business signup: DynamoDB client initialized successfully');
    
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

    // TODO: Restore business existence check once scan operations are working
    // Check if business already exists using DynamoDB Scan
    console.log('🔧 Business signup: Skipping business existence check for testing...');

    // TODO: Restore user existence check once scan operations are working
    // Check if business user already exists using DynamoDB Scan
    console.log('🔧 Business signup: Skipping user existence check for testing...');

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

    // Create business with detected neighborhood using DynamoDB PutItem
    console.log('🔧 Business signup: Creating business...');
    const businessId = `business-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const businessData = {
      id: businessId,
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
    };

    const businessPutCommand = new PutItemCommand({
      TableName: "Business-7cdlttoiifewxgyh7sodc6czx4-NONE",
      Item: marshall(businessData),
    });

    await dynamoClient.send(businessPutCommand);
    console.log('🔧 Business signup: Business created successfully:', businessId);

    // Create business user using DynamoDB PutItem
    console.log('🔧 Business signup: Creating business user...');
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userData = {
      id: userId,
      businessId: businessId,
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
      role: "owner",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const userPutCommand = new PutItemCommand({
      TableName: "BusinessUser-7cdlttoiifewxgyh7sodc6czx4-NONE",
      Item: marshall(userData),
    });

    await dynamoClient.send(userPutCommand);
    console.log('🔧 Business signup: Business user created successfully:', userId);

    console.log('🔧 Business signup: Successfully created business and user:', {
      businessId: businessId,
      businessName: businessData.name,
      neighborhood: businessData.neighborhood,
      userId: userId,
      userEmail: userData.email
    });

    // Send confirmation email to the user
    try {
      console.log('🔧 Business signup: Sending confirmation email...');
      await sendStatusChangeEmail({
        userEmail: userData.email,
        businessName: businessData.name,
        userName: `${userData.firstName} ${userData.lastName}`,
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
        id: businessId,
        name: businessData.name,
        status: businessData.status,
        neighborhood: businessData.neighborhood,
      },
      user: {
        id: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
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