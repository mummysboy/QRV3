import { NextResponse } from "next/server";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  region: "us-west-1", // Updated to match project region
});

export async function POST(req: Request) {
  const { to, url, header } = await req.json();
  
  console.log("📱 SMS API called with:", { to, url, header });

  if (!to || !url) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    // Clean the phone number (remove formatting)
    const cleanPhone = to.replace(/\D/g, '');
    
    // Add country code if not present (assuming US numbers)
    const phoneWithCountryCode = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;

    console.log("📱 Phone number processing:", { 
      original: to, 
      cleaned: cleanPhone, 
      withCountryCode: phoneWithCountryCode 
    });

    // Create SMS message
    const message = header 
      ? `🎁 Your ${header} reward is ready! View it here: ${url}`
      : `🎁 Your reward is ready! View it here: ${url}`;

    console.log("📱 SMS message:", message);

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

    console.log("📱 Sending SMS via SNS...");
    console.log("📱 SNS Command:", JSON.stringify(command, null, 2));
    const result = await snsClient.send(command);
    console.log("📱 SNS response:", JSON.stringify(result, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("📱 SNS error:", error);
    
    // Provide more specific error messages for common issues
    let errorMessage = "Failed to send SMS";
    if (error instanceof Error) {
      if (error.message.includes("InvalidParameter")) {
        errorMessage = "Invalid phone number format";
      } else if (error.message.includes("OptOut")) {
        errorMessage = "Phone number has opted out of SMS";
      } else if (error.message.includes("Throttled")) {
        errorMessage = "SMS sending rate limit exceeded";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 