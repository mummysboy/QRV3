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

    const client = generateClient({ authMode: "apiKey" });

    // Update the claimed reward with redemption timestamp
    let updateResult;
    try {
      updateResult = await client.graphql({
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
    } catch (updateError) {
      console.error("Error updating claimed reward:", updateError);
      return NextResponse.json(
        { error: "Failed to update claimed reward", details: updateError instanceof Error ? updateError.message : String(updateError) },
        { status: 500 }
      );
    }

    // Delete the claimed reward after redemption
    let deleteResult;
    try {
      deleteResult = await client.graphql({
        query: `
          mutation DeleteClaimedReward($id: String!) {
            deleteClaimedReward(input: { id: $id }) {
              id
            }
          }
        `,
        variables: {
          id: claimedRewardId,
        },
      });
    } catch (deleteError) {
      console.error("Error deleting claimed reward:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete claimed reward", details: deleteError instanceof Error ? deleteError.message : String(deleteError) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reward redeemed and deleted successfully",
      data: { updateResult, deleteResult },
    });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return NextResponse.json(
      { error: "Failed to redeem reward" },
      { status: 500 }
    );
  }
}
