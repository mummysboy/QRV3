import { NextResponse } from "next/server";
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";

export async function GET() {
  try {
    console.log("🧪 Testing DynamoDB access...");
    
    // Create DynamoDB client
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    // Test listing tables
    const command = new ListTablesCommand({});
    const result = await dynamoClient.send(command);
    
    console.log("✅ DynamoDB access successful");
    console.log("📋 Available tables:", result.TableNames);

    return NextResponse.json({
      success: true,
      message: "DynamoDB access successful",
      tables: result.TableNames,
      config: {
        region: process.env.REGION,
        hasAccessKey: !!process.env.ACCESS_KEY_ID,
        hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
      }
    });
  } catch (error: any) {
    console.error("❌ DynamoDB test failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      config: {
        region: process.env.REGION,
        hasAccessKey: !!process.env.ACCESS_KEY_ID,
        hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
      }
    }, { status: 500 });
  }
}
