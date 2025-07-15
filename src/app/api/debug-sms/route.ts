import { NextResponse } from "next/server";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

export async function POST(req: Request) {
  const { phoneNumber } = await req.json();
  
  console.log("🔍 DEBUG: SMS Debug endpoint called");
  console.log("🔍 DEBUG: Phone number:", phoneNumber);

  // Check environment variables
  console.log("🔍 DEBUG: Environment variables:");
  console.log("🔍 DEBUG: ACCESS_KEY_ID exists:", !!process.env.ACCESS_KEY_ID);
  console.log("🔍 DEBUG: SECRET_ACCESS_KEY exists:", !!process.env.SECRET_ACCESS_KEY);
  console.log("🔍 DEBUG: REGION:", process.env.REGION);
  console.log("🔍 DEBUG: AWS_REGION:", process.env.AWS_REGION);

  try {
    // Create SNS client with explicit configuration
    const snsClient = new SNSClient({
      region: "us-west-1",
      // Add credentials if they exist
      ...(process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY && {
        credentials: {
          accessKeyId: process.env.ACCESS_KEY_ID,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
      }),
    });

    console.log("🔍 DEBUG: SNS client created successfully");

    // Clean the phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const phoneWithCountryCode = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;

    console.log("🔍 DEBUG: Phone processing:", {
      original: phoneNumber,
      cleaned: cleanPhone,
      withCountryCode: phoneWithCountryCode
    });

    // Create test message
    const message = "🔍 DEBUG: Test SMS from QRewards - Debug mode";

    const command = new PublishCommand({
      Message: message,
      PhoneNumber: phoneWithCountryCode,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        }
      }
    });

    console.log("🔍 DEBUG: SNS Command created:", JSON.stringify(command, null, 2));

    console.log("🔍 DEBUG: Attempting to send SMS...");
    const result = await snsClient.send(command);
    console.log("🔍 DEBUG: SNS response:", JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: true,
      messageId: result.MessageId,
      phoneNumber: phoneWithCountryCode,
      debug: {
        hasAccessKey: !!process.env.ACCESS_KEY_ID,
        hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
        region: "us-west-1",
        usingIAM: !process.env.ACCESS_KEY_ID && !process.env.SECRET_ACCESS_KEY
      }
    });

  } catch (error) {
    console.error("🔍 DEBUG: SNS error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      debug: {
        hasAccessKey: !!process.env.ACCESS_KEY_ID,
        hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
        region: "us-west-1",
        usingIAM: !process.env.ACCESS_KEY_ID && !process.env.SECRET_ACCESS_KEY
      }
    }, { status: 500 });
  }
} 