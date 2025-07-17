// /src/app/api/redeem-reward/route.ts
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

    const client = generateClient();

    // Update the claimed reward with redemption timestamp
    const updateResult = await client.graphql({
      query: `
        mutation UpdateClaimedReward($input: UpdateClaimedRewardInput!) {
          updateClaimedReward(input: $input) {
            id
            cardid
            redeemed_at
            businessId
          }
        }
      `,
      variables: {
        input: {
          id: claimedRewardId,
          redeemed_at: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reward redeemed successfully",
      data: updateResult,
    });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return NextResponse.json(
      { error: "Failed to redeem reward" },
      { status: 500 }
    );
  }
}
