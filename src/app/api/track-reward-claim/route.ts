import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";

export async function POST(request: NextRequest) {
  try {
    const { cardid, businessId, email, phone, delivery_method } = await request.json();

    if (!cardid) {
      return NextResponse.json(
        { error: "Card ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient({ authMode: "apiKey" });

    // Get IP address and user agent
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create claim analytics record
    const claimData = {
      cardid,
      businessId: businessId || "",
      email: email || "",
      phone: phone || "",
      delivery_method: delivery_method || "email",
      claimed_at: new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
    };

    await client.graphql({
      query: `
        mutation CreateRewardClaim($input: CreateRewardClaimInput!) {
          createRewardClaim(input: $input) {
            id
            cardid
            businessId
            email
            phone
            delivery_method
            claimed_at
            ip_address
            user_agent
          }
        }
      `,
      variables: {
        input: claimData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reward claim tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking reward claim:", error);
    return NextResponse.json(
      { error: "Failed to track reward claim" },
      { status: 500 }
    );
  }
}
