import { NextResponse } from "next/server";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  region: "us-west-1",
});

export async function POST(req: Request) {
  const { phoneNumber } = await req.json();
  
  console.log("🧪 Testing SMS with phone number:", phoneNumber);

  if (!phoneNumber) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 });
  }

  try {
    // Clean the phone number (remove formatting)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming US numbers)
    const phoneWithCountryCode = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;

    console.log("🧪 Phone number processing:", { 
      original: phoneNumber, 
      cleaned: cleanPhone, 
      withCountryCode: phoneWithCountryCode 
    });

    // Create test SMS message
    const message = "🧪 Test SMS from QRewards - Your SMS functionality is working!";

    console.log("🧪 Test SMS message:", message);

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

    console.log("🧪 Sending test SMS via SNS...");
    const result = await snsClient.send(command);
    console.log("🧪 SNS test response:", result);

    return NextResponse.json({ 
      success: true, 
      messageId: result.MessageId,
      phoneNumber: phoneWithCountryCode
    });
  } catch (error) {
    console.error("🧪 SNS test error:", error);
    return NextResponse.json(
      { 
        error: "Failed to send test SMS", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 