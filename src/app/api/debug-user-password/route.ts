import { NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("🔍 Debug: Checking password for email:", email);
    const dynamoClient = new DynamoDBClient({
      region: process.env.REGION || "us-west-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
    });

    // Scan the BusinessUser table for the specific email
    const scanCommand = new ScanCommand({
      TableName: "BusinessUser-7cdlttoiifewxgyh7sodc6czx4-NONE",
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": { S: email }
      }
    });

    const result = await dynamoClient.send(scanCommand);
    const users = result.Items?.map(item => unmarshall(item)) || [];

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No users found with this email"
      });
    }

    // Return user info without exposing the actual password hash
    return NextResponse.json({
      success: true,
      message: "User found",
      user: {
        id: users[0].id,
        email: users[0].email,
        businessId: users[0].businessId,
        status: users[0].status,
        hasPassword: !!users[0].password,
        passwordLength: users[0].password ? users[0].password.length : 0,
        passwordStartsWith: users[0].password ? users[0].password.substring(0, 10) + "..." : "No password"
      }
    });
    
  } catch (error) {
    console.error("❌ Debug: Error checking user password:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
