import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export async function GET(request: NextRequest) {
  console.log("🧪 Testing SES access...");
  
  try {
    // Test 1: Basic SES client creation
    console.log("🧪 Test 1: Creating SES client...");
    const sesClient = new SESClient({
      region: "us-west-1",
    });
    console.log("✅ SES client created successfully");
    
    // Test 2: Check environment variables
    console.log("🧪 Test 2: Environment variables...");
    console.log("🧪 ACCESS_KEY_ID exists:", !!process.env.ACCESS_KEY_ID);
    console.log("🧪 SECRET_ACCESS_KEY exists:", !!process.env.SECRET_ACCESS_KEY);
    console.log("🧪 SESSION_TOKEN exists:", !!process.env.SESSION_TOKEN);
    console.log("🧪 SES_FROM_EMAIL:", process.env.SES_FROM_EMAIL || "not set");
    
    // Test 3: Try to send a test email (this will fail but show the exact error)
    console.log("🧪 Test 3: Attempting to send test email...");
    const command = new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL || "test@example.com",
      Destination: {
        ToAddresses: ["test@example.com"],
      },
      Message: {
        Subject: {
          Data: "Test Email",
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: "This is a test email to verify SES permissions.",
            Charset: "UTF-8",
          },
        },
      },
    });
    
    try {
      await sesClient.send(command);
      console.log("✅ Test email sent successfully (unexpected!)");
    } catch (sendError) {
      console.log("❌ Test email failed (expected):", sendError);
      
      // Log detailed error information
      if (sendError && typeof sendError === 'object') {
        const errorObj = sendError as Record<string, unknown>;
        console.log("❌ Error details:", {
          name: errorObj.name,
          message: errorObj.message,
          code: (errorObj as any).$metadata?.httpStatusCode,
          requestId: (errorObj as any).$metadata?.requestId,
        });
      }
      
      return NextResponse.json({
        success: false,
        message: "SES test completed - email sending failed as expected",
        error: {
          name: (sendError as any)?.name || "Unknown",
          message: (sendError as any)?.message || "Unknown error",
          code: (sendError as any)?.$metadata?.httpStatusCode || "Unknown",
        },
        analysis: {
          sesClientCreated: true,
          environmentVariables: {
            accessKeyId: !!process.env.ACCESS_KEY_ID,
            secretAccessKey: !!process.env.SECRET_ACCESS_KEY,
            sessionToken: !!process.env.SESSION_TOKEN,
            sesFromEmail: !!process.env.SES_FROM_EMAIL,
          },
          recommendation: "Check IAM permissions for SES:SendEmail and SES:SendRawEmail"
        }
      });
    }
    
  } catch (error) {
    console.error("❌ SES test failed:", error);
    return NextResponse.json({
      success: false,
      message: "SES test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      analysis: {
        sesClientCreated: false,
        environmentVariables: {
          accessKeyId: !!process.env.ACCESS_KEY_ID,
          secretAccessKey: !!process.env.SECRET_ACCESS_KEY,
          sessionToken: !!process.env.SESSION_TOKEN,
          sesFromEmail: !!process.env.SES_FROM_EMAIL,
        },
        recommendation: "Check AWS credentials and region configuration"
      }
    }, { status: 500 });
  }
}
