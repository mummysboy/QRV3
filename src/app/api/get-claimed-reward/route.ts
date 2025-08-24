// /src/app/api/get-claimed-reward/route.ts
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cardId = searchParams.get("id");

  if (!cardId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const client = generateClient({ authMode: "apiKey" });
    
    console.log('🔍 Looking for claimed reward with cardId:', cardId);
    
    // Find the claimed reward for this card
    const result = await client.graphql({
      query: `
        query GetClaimedRewardByCard($cardid: String!) {
          listClaimedRewards(filter: { cardid: { eq: $cardid } }) {
            items {
              id
              cardid
              email
              phone
              delivery_method
              logokey
              header
              subheader
              addressurl
              addresstext
              expires
              claimed_at
              businessId
            }
          }
        }
      `,
      variables: { cardid: cardId }
    });
    
    const claimedRewards = result.data.listClaimedRewards.items;
    
    if (claimedRewards.length === 0) {
      console.log('❌ No claimed rewards found for cardId:', cardId);
      return NextResponse.json({ error: "Claimed reward not found" }, { status: 404 });
    }
    
    // Return the most recent claimed reward
    const claimedReward = claimedRewards[claimedRewards.length - 1];
    console.log('✅ Found claimed reward:', claimedReward.id);
    
    return NextResponse.json(claimedReward);
    
  } catch (error) {
    console.error("❌ Get claimed reward error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
