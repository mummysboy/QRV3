import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

export async function POST(request: NextRequest) {
  try {
    const { cardid, businessId } = await request.json();

    if (!cardid) {
      return NextResponse.json(
        { error: "Card ID is required" },
        { status: 400 }
      );
    }

    // Create DynamoDB client
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    // Get IP address and user agent
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create card view record
    const viewData = {
      id: `view-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cardid,
      businessId: businessId || "",
      viewed_at: new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Insert into CardView table
    const putCommand = new PutItemCommand({
      TableName: "CardView-7cdlttoiifewxgyh7sodc6czx4-NONE",
      Item: marshall(viewData),
    });

    await dynamoClient.send(putCommand);

    return NextResponse.json({
      success: true,
      message: "Card view tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking card view:", error);
    return NextResponse.json(
      { error: "Failed to track card view" },
      { status: 500 }
    );
  }
} 