import { NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export async function GET() {
  try {
    console.log("🔍 Testing Business table access...");
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    // Scan the Business table
    const scanCommand = new ScanCommand({
      TableName: "Business-7cdlttoiifewxgyh7sodc6czx4-NONE",
      Limit: 10
    });

    const result = await dynamoClient.send(scanCommand);
    const businesses = result.Items?.map(item => unmarshall(item)) || [];

    console.log("✅ Business table access successful");
    console.log("📋 Found businesses:", businesses.length);
    
    return NextResponse.json({
      success: true,
      message: "Business table access successful",
      businessCount: businesses.length,
      businesses: businesses.map(business => ({
        id: business.id,
        name: business.name,
        status: business.status,
        email: business.email,
        zipCode: business.zipCode
      }))
    });
  } catch (error: any) {
    console.error("❌ Business table test failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.name
    }, { status: 500 });
  }
}
