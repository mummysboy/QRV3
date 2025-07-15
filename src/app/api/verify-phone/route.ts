import { NextResponse } from "next/server";
import { SNSClient, CheckIfPhoneNumberIsOptedOutCommand } from "@aws-sdk/client-sns";

export async function POST(req: Request) {
  const { phoneNumber } = await req.json();
  
  console.log("📱 VERIFY: Phone verification endpoint called");
  console.log("📱 VERIFY: Phone number:", phoneNumber);

  try {
    const snsClient = new SNSClient({
      region: "us-west-1",
    });

    // Clean the phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const phoneWithCountryCode = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;

    console.log("📱 VERIFY: Phone processing:", {
      original: phoneNumber,
      cleaned: cleanPhone,
      withCountryCode: phoneWithCountryCode
    });

    // Check if phone number is opted out
    const checkCommand = new CheckIfPhoneNumberIsOptedOutCommand({
      phoneNumber: phoneWithCountryCode
    });

    console.log("📱 VERIFY: Checking if phone is opted out...");
    const optOutResult = await snsClient.send(checkCommand);
    
    console.log("📱 VERIFY: Opt-out check result:", JSON.stringify(optOutResult, null, 2));

    return NextResponse.json({
      success: true,
      phoneNumber: phoneWithCountryCode,
      isOptedOut: optOutResult.isOptedOut,
      verification: {
        original: phoneNumber,
        cleaned: cleanPhone,
        formatted: phoneWithCountryCode,
        isValid: phoneWithCountryCode.length >= 10 && phoneWithCountryCode.length <= 15
      }
    });

  } catch (error) {
    console.error("📱 VERIFY: Error:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      phoneNumber: phoneNumber
    }, { status: 500 });
  }
} 