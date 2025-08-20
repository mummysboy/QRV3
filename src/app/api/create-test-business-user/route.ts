import { NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    console.log("🔧 Creating test business user...");
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    // Generate a test password hash
    const testPassword = "test123";
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    const testUser = {
      id: `test-user-${Date.now()}`,
      email: "test@business.com",
      password: hashedPassword,
      firstName: "Test",
      lastName: "Business",
      businessId: "test-business-123",
      role: "owner",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const putCommand = new PutItemCommand({
      TableName: "BusinessUser-7cdlttoiifewxgyh7sodc6czx4-NONE",
      Item: marshall(testUser),
    });

    await dynamoClient.send(putCommand);
    
    console.log("✅ Test business user created successfully:", testUser.id);
    return NextResponse.json({ 
      success: true, 
      message: "Test business user created successfully", 
      user: {
        id: testUser.id,
        email: testUser.email,
        password: testPassword, // Return the plain text password for testing
        businessId: testUser.businessId
      }
    });
  } catch (error) {
    console.error("❌ Failed to create test business user:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
