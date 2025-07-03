import { NextResponse } from "next/server";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  region: "us-east-1", // Changed to us-east-1 which has better SMS support
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
    const result = await snsClient.send(command);
    console.log("📱 SNS response:", result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SNS error:", error);
    return NextResponse.json(
      { error: "Failed to send SMS", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 