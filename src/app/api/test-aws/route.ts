import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export async function GET() {
  try {
    console.log("🧪 Testing AWS configuration...");
    console.log("🔧 ACCESS_KEY_ID:", process.env.ACCESS_KEY_ID?.substring(0, 4) + "...");
    console.log("🔧 SECRET_ACCESS_KEY exists:", !!process.env.SECRET_ACCESS_KEY);
    console.log("🔧 REGION:", process.env.REGION);

    // Initialize DynamoDBClient to test AWS configuration
    new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    return NextResponse.json({
      success: true,
      message: "AWS client created successfully",
      config: {
        region: process.env.REGION,
        hasAccessKey: !!process.env.ACCESS_KEY_ID,
        hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
      }
    });
  } catch (error: any) {
    console.error("❌ AWS test failed:", error);
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