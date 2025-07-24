import { NextResponse } from "next/server";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  region: "us-west-1", // Updated to match project region
});

export async function POST(req: Request) {
  const { to, url, header, businessName, expires } = await req.json();
  
  console.log("📱 SMS API called with:", { to, url, header, businessName, expires });

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
    let formattedExpires = '';
    if (expires) {
      const date = new Date(expires);
      if (!isNaN(date.getTime())) {
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yyyy = date.getFullYear();
        formattedExpires = `${mm}/${dd}/${yyyy}`;
      } else {
        formattedExpires = expires; // fallback to raw value
      }
    }

    // Build a clear, compliant SMS message
    let message = 'QRewards\n';
    if (header || businessName) {
      message += ` ${header ? header + ' - ' : ''}${businessName ? businessName + ' - ' : ''}`;
    }
    message += 'Your reward is ready!';
    if (formattedExpires) message += ` Expires: ${formattedExpires}.`;
    message += `\n\nView it: ${url}`;
    message += `\n\nReply STOP to unsubscribe.`;

    console.log("📱 SMS message:", message);

    const publishCommand = new PublishCommand({
      Message: message,
      PhoneNumber: phoneWithCountryCode,
    });

    await snsClient.send(publishCommand);

    return NextResponse.json({ message: "SMS sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}