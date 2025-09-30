import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";

export async function POST(request: NextRequest) {
  try {
    const { claimedRewardId } = await request.json();

    if (!claimedRewardId) {
      return NextResponse.json(
        { error: "Claimed reward ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient({ authMode: "apiKey" });

    // Get IP address and user agent
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Get the claimed reward details to include in analytics
    let claimedReward;
    try {
      const getResult = await client.graphql({
        query: `
          query GetClaimedReward($id: String!) {
            getClaimedReward(id: $id) {
              id
              cardid
              businessId
              claimed_at
              redeemed_at
            }
          }
        `,
        variables: { id: claimedRewardId },
      });
      
      claimedReward = (getResult as any).data.getClaimedReward;
      
      if (!claimedReward) {
        return NextResponse.json(
          { error: "Claimed reward not found" },
          { status: 404 }
        );
      }
    } catch (getError) {
      console.error("Error getting claimed reward for analytics:", getError);
      return NextResponse.json(
        { error: "Failed to get claimed reward details" },
        { status: 500 }
      );
    }

    // Create redemption analytics record
    const redemptionData = {
      claimedRewardId,
      cardid: claimedReward.cardid,
      businessId: claimedReward.businessId || "",
      redeemed_at: new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
    };

    await client.graphql({
      query: `
        mutation CreateRewardRedemption($input: CreateRewardRedemptionInput!) {
          createRewardRedemption(input: $input) {
            id
            claimedRewardId
            cardid
            businessId
            redeemed_at
            ip_address
            user_agent
          }
        }
      `,
      variables: {
        input: redemptionData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reward redemption tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking reward redemption:", error);
    return NextResponse.json(
      { error: "Failed to track reward redemption" },
      { status: 500 }
    );
  }
}
