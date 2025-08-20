import { NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

export async function POST() {
  try {
    console.log("🔧 Creating test business...");
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    const testBusiness = {
      id: "test-business-123",
      name: "Test Coffee Shop",
      email: "test@business.com",
      phone: "+1234567890",
      zipCode: "90210",
      category: "Food & Beverage",
      status: "approved",
      address: "123 Test Street",
      city: "Test City",
      state: "CA",
      website: "https://testcoffee.com",
      description: "A test business for development purposes",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
    };

    const putCommand = new PutItemCommand({
      TableName: "Business-7cdlttoiifewxgyh7sodc6czx4-NONE",
      Item: marshall(testBusiness),
    });

    await dynamoClient.send(putCommand);
    
    console.log("✅ Test business created successfully:", testBusiness.id);
    return NextResponse.json({ 
      success: true, 
      message: "Test business created successfully", 
      business: testBusiness
    });
  } catch (error) {
    console.error("❌ Failed to create test business:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
