import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Validate JWT_SECRET
if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  console.error("🔍 JWT_SECRET is not properly configured!");
}

interface LoginData {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Business login API called");
    console.log("🔍 Environment check - JWT_SECRET:", !!process.env.JWT_SECRET);
    console.log("🔍 Environment check - NODE_ENV:", process.env.NODE_ENV);
    
    // Validate environment variables
    if (!process.env.JWT_SECRET) {
      console.error("🔍 JWT_SECRET environment variable is not set!");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { email, password }: LoginData = body;
    
    console.log("🔍 Login attempt for email:", email);

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("🔍 Creating DynamoDB client...");
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });
    console.log("🔍 DynamoDB client created successfully");

    // Find all users by email (user might have multiple businesses)
    console.log("🔍 Querying for business users with email:", email);
    let users: any[] = [];
    
    try {
      // Scan the BusinessUser table for users with matching email
      const scanCommand = new ScanCommand({
        TableName: "BusinessUser-7cdlttoiifewxgyh7sodc6czx4-NONE",
        FilterExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": { S: email }
        }
      });
      
      const userResult = await dynamoClient.send(scanCommand);
      users = userResult.Items?.map(item => unmarshall(item)) || [];
      
      console.log("🔍 DynamoDB scan successful, found users:", users.length);
      console.log("🔍 Users found:", users.map(u => ({ id: u.id, businessId: u.businessId, email: u.email, status: u.status })));
    } catch (dbError) {
      console.error("🔍 DynamoDB scan error:", dbError);
      return NextResponse.json(
        { error: "Failed to query user data", details: dbError instanceof Error ? dbError.message : "Unknown database error" },
        { status: 500 }
      );
    }

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
    console.log("🔍 Verifying password with bcrypt...");
    try {
      const isValidPassword = await bcrypt.compare(password, validUser.password);
      console.log("🔍 Password verification result:", isValidPassword);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
    } catch (bcryptError) {
      console.error("🔍 Bcrypt error:", bcryptError);
      return NextResponse.json(
        { error: "Password verification failed" },
        { status: 500 }
      );
    }

    // Get all businesses for this user
    console.log("🔍 Fetching businesses for user...");
    const businessIds = users.map(user => user.businessId);
    const businesses = [];
    
    for (const businessId of businessIds) {
      try {
        console.log("🔍 Fetching business:", businessId);
        const getCommand = new GetItemCommand({
          TableName: "Business-7cdlttoiifewxgyh7sodc6czx4-NONE",
          Key: marshall({ id: businessId })
        });

        const businessResult = await dynamoClient.send(getCommand);
        const business = businessResult.Item ? unmarshall(businessResult.Item) : null;

        if (business) {
          businesses.push(business);
          console.log("🔍 Business added:", business.name);
        }
      } catch (err) {
        console.error(`🔍 Error fetching business ${businessId}:`, err);
      }
    }
    
    console.log("🔍 Total businesses found:", businesses.length);

    // Find approved businesses
    const approvedBusinesses = businesses.filter(business => business.status === "approved");
    
    if (approvedBusinesses.length === 0) {
      return NextResponse.json(
        { error: "No approved businesses found. Please wait for approval." },
        { status: 403 }
      );
    }

    // Check if there's a stored last business ID in the request headers
    const lastBusinessId = request.headers.get('x-last-business-id');
    let primaryBusiness = approvedBusinesses[0]; // Default to first approved business
    let primaryUser = users.find(user => user.businessId === primaryBusiness.id);

    // ALWAYS prioritize the last business ID if provided, regardless of session cookie
    if (lastBusinessId) {
      const lastBusiness = approvedBusinesses.find(business => business.id === lastBusinessId);
      
      if (lastBusiness) {
        primaryBusiness = lastBusiness;
        primaryUser = users.find(user => user.businessId === primaryBusiness.id);
      }
    }

    if (!primaryUser) {
      return NextResponse.json(
        { error: "User not found for primary business" },
        { status: 404 }
      );
    }

    // Generate a JWT session token for the primary business user
    console.log("🔍 JWT_SECRET available:", !!JWT_SECRET);
    console.log("🔍 JWT_SECRET length:", JWT_SECRET ? JWT_SECRET.length : 0);
    
    const payload = {
      sub: primaryUser.id,
      email: primaryUser.email,
      businessId: primaryBusiness.id,
      role: "business",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 days
    };
    
    console.log("🔍 Signing JWT with payload:", payload);
    let sessionToken: string;
    try {
      sessionToken = jwt.sign(payload, JWT_SECRET);
      console.log("🔍 JWT token generated successfully");
    } catch (jwtError) {
      console.error("🔍 JWT signing error:", jwtError);
      return NextResponse.json(
        { error: "Failed to generate session token" },
        { status: 500 }
      );
    }

    // Update last login time for the primary user
    console.log("🔍 Updating last login time...");
    try {
      const updateCommand = new UpdateItemCommand({
        TableName: "BusinessUser-7cdlttoiifewxgyh7sodc6czx4-NONE",
        Key: marshall({ id: primaryUser.id }),
        UpdateExpression: "SET lastLoginAt = :lastLoginAt",
        ExpressionAttributeValues: {
          ":lastLoginAt": { S: new Date().toISOString() }
        }
      });
      
      await dynamoClient.send(updateCommand);
      console.log("🔍 Last login time updated successfully");
    } catch (updateError) {
      console.error("🔍 Error updating last login time:", updateError);
      // Don't fail the login for this error, just log it
    }

    // Set the session cookie
    console.log("🔍 Creating response...");
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
    
    console.log("🔍 Response created successfully");

    // Set the session cookie with the selected business ID
    console.log("🔍 Setting session cookie...");
    try {
      response.cookies.set('qrewards_session', sessionToken, {
        httpOnly: true,
        secure: false, // Temporarily disable for testing
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
      console.log("🔍 Session cookie set successfully");
    } catch (cookieError) {
      console.error("🔍 Error setting session cookie:", cookieError);
      // Don't fail the login for this error, just log it
    }

    console.log("🔍 Login process completed successfully");
    return response;
  } catch (error) {
    console.error("Login error:", error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: "Login failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 