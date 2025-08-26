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

    // First, get the claimed reward details to check if it's already redeemed
    let claimedReward;
    try {
      const getResult = await client.graphql({
        query: `
          query GetClaimedReward($id: String!) {
            getClaimedReward(id: $id) {
              id
              cardid
              redeemed_at
              businessId
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
      
      console.log("🔍 Claimed reward data:", JSON.stringify(claimedReward, null, 2));
      console.log("🔍 redeemed_at field value:", claimedReward.redeemed_at);
      console.log("🔍 redeemed_at field type:", typeof claimedReward.redeemed_at);
      console.log("🔍 Is redeemed_at truthy?", !!claimedReward.redeemed_at);
      
      // Check if this reward has already been redeemed
      // Check for both truthy values and non-empty strings
      if (claimedReward.redeemed_at && claimedReward.redeemed_at.trim() !== '') {
        console.log("❌ Reward already redeemed, redeemed_at value:", claimedReward.redeemed_at);
        return NextResponse.json(
          { error: "This reward has already been redeemed" },
          { status: 400 }
        );
      }
      
      // For debugging, return the actual data to see what's in the redeemed_at field
      if (claimedReward.redeemed_at !== null && claimedReward.redeemed_at !== undefined) {
        console.log("🔍 redeemed_at field exists but might be falsy:", claimedReward.redeemed_at);
        return NextResponse.json({
          error: "Debug: redeemed_at field exists",
          data: claimedReward,
          redeemed_at_value: claimedReward.redeemed_at,
          redeemed_at_type: typeof claimedReward.redeemed_at,
          raw_response: getResult
        }, { status: 400 });
      }
      
      console.log("✅ Reward not redeemed yet, proceeding with redemption");
      
    } catch (getError) {
      console.error("Error getting claimed reward:", getError);
      return NextResponse.json(
        { error: "Failed to get claimed reward", details: getError instanceof Error ? getError.message : String(getError) },
        { status: 500 }
      );
    }

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

    // Check if there are other claimed rewards for the same card that haven't been redeemed
    // This prevents the same card from being redeemed multiple times
    try {
      const otherRewardsResult = await client.graphql({
        query: `
          query ListOtherClaimedRewards($cardid: String!, $excludeId: String!) {
            listClaimedRewards(filter: { 
              and: [
                { cardid: { eq: $cardid } },
                { id: { ne: $excludeId } },
                { redeemed_at: { attributeExists: false } }
              ]
            }) {
              items {
                id
                cardid
                redeemed_at
              }
            }
          }
        `,
        variables: { 
          cardid: claimedReward.cardid,
          excludeId: claimedRewardId 
        },
      });
      
      const otherRewards = (otherRewardsResult as any).data.listClaimedRewards.items;
      
      // If there are other unredeemed rewards for the same card, mark them as redeemed too
      // This prevents multiple redemptions of the same card
      for (const otherReward of otherRewards) {
        try {
          await client.graphql({
            query: `
              mutation UpdateOtherClaimedReward($input: UpdateClaimedRewardInput!) {
                updateClaimedReward(input: $input) {
                  id
                  cardid
                  redeemed_at
                }
              }
            `,
            variables: {
              input: {
                id: otherReward.id,
                redeemed_at: new Date().toISOString(),
              },
            },
          });
          console.log(`✅ Marked other claimed reward ${otherReward.id} as redeemed to prevent multiple redemptions`);
        } catch (updateOtherError) {
          console.error(`❌ Failed to update other claimed reward ${otherReward.id}:`, updateOtherError);
          // Continue with other updates even if one fails
        }
      }
      
    } catch (checkOtherError) {
      console.error("Error checking other claimed rewards:", checkOtherError);
      // Don't fail the redemption if this check fails
    }

    return NextResponse.json({
      success: true,
      message: "Reward redeemed successfully",
      data: { updateResult },
    });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return NextResponse.json(
      { error: "Failed to redeem reward" },
      { status: 500 }
    );
  }
}
