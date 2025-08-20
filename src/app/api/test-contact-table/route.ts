import { NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

export async function GET() {
  try {
    console.log("🧪 Testing Contact table access...");
    
    // Create DynamoDB client
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    // Test scanning the Contact table
    const command = new ScanCommand({
      TableName: "Contact-7cdlttoiifewxgyh7sodc6czx4-NONE",
      Limit: 5 // Only get first 5 items for testing
    });
    
    const result = await dynamoClient.send(command);
    
    console.log("✅ Contact table access successful");
    console.log("📋 Items found:", result.Items?.length || 0);

    return NextResponse.json({
      success: true,
      message: "Contact table access successful",
      itemsFound: result.Items?.length || 0,
      sampleItems: result.Items?.slice(0, 2) || [],
      config: {
        region: process.env.REGION,
        hasAccessKey: !!process.env.ACCESS_KEY_ID,
        hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
      }
    });
  } catch (error: any) {
    console.error("❌ Contact table test failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.name,
      config: {
        region: process.env.REGION,
        hasAccessKey: !!process.env.ACCESS_KEY_ID,
        hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
      }
    }, { status: 500 });
  }
}
