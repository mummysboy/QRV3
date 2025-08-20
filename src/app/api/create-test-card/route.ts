import { NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

export async function POST() {
  try {
    console.log("🔧 Creating test card...");
    
    // Create DynamoDB client
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    // Create a test card with future expiration date
    const testCard = {
      cardid: `test-card-${Date.now()}`,
      quantity: 10,
      header: "Test Coffee Shop",
      subheader: "Free coffee with any purchase!",
      addresstext: "123 Test Street, Test City, CA 90210",
      addressurl: "123 Test Street, Test City, CA 90210",
      logokey: "logos/test-coffee-shop.png",
      expires: "2025-12-31T23:59:59.000Z", // Far future date
      neighborhood: "Test Neighborhood",
      businessId: "test-business-123",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert the test card
    const putCommand = new PutItemCommand({
      TableName: "Card-7cdlttoiifewxgyh7sodc6czx4-NONE",
      Item: marshall(testCard),
    });

    await dynamoClient.send(putCommand);

    console.log("✅ Test card created successfully:", testCard.cardid);

    return NextResponse.json({
      success: true,
      message: "Test card created successfully",
      card: testCard
    });
    
  } catch (error) {
    console.error("❌ Failed to create test card:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
