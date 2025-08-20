import { NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export async function GET() {
  try {
    console.log("🔍 Testing BusinessUser table access...");
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    // Scan the BusinessUser table
    const scanCommand = new ScanCommand({
      TableName: "BusinessUser-7cdlttoiifewxgyh7sodc6czx4-NONE",
      Limit: 10
    });

    const result = await dynamoClient.send(scanCommand);
    const users = result.Items?.map(item => unmarshall(item)) || [];

    console.log("✅ BusinessUser table access successful");
    console.log("📋 Found users:", users.length);
    
    return NextResponse.json({
      success: true,
      message: "BusinessUser table access successful",
      userCount: users.length,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        businessId: user.businessId,
        status: user.status,
        hasPassword: !!user.password
      }))
    });
  } catch (error: any) {
    console.error("❌ BusinessUser table test failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.name
    }, { status: 500 });
  }
}
