import { NextResponse } from "next/server";
import { SNSClient, GetSMSAttributesCommand } from "@aws-sdk/client-sns";

export async function GET() {
  console.log("📱 STATUS: Checking SNS SMS status...");

  try {
    const snsClient = new SNSClient({
      region: "us-west-1",
    });

    const command = new GetSMSAttributesCommand({
      attributes: [
        'DefaultSMSType',
        'DefaultSenderID',
        'SpendingLimit'
      ]
    });

    console.log("📱 STATUS: Getting SNS attributes...");
    const result = await snsClient.send(command);
    
    console.log("📱 STATUS: SNS attributes:", JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: true,
      attributes: result.attributes,
      status: {
        defaultSMSType: result.attributes?.DefaultSMSType,
        defaultSenderID: result.attributes?.DefaultSenderID,
        spendingLimit: result.attributes?.SpendingLimit
      }
    });

  } catch (error) {
    console.error("📱 STATUS: Error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 