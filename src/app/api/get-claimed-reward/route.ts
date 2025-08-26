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
    
    // Find the claimed reward for this card that hasn't been redeemed yet
    const result = await client.graphql({
      query: `
        query GetClaimedRewardByCard($cardid: String!) {
          listClaimedRewards(filter: { 
            and: [
              { cardid: { eq: $cardid } },
              { redeemed_at: { attributeExists: false } }
            ]
          }) {
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
              redeemed_at
            }
          }
        }
      `,
      variables: { cardid: cardId }
    });
    
    const claimedRewards = (result as any).data.listClaimedRewards.items;
    
    if (claimedRewards.length === 0) {
      console.log('❌ No unredeemed claimed rewards found for cardId:', cardId);
      return NextResponse.json({ 
        error: "Claimed reward not found or already redeemed and removed" 
      }, { status: 404 });
    }
    
    // Return the most recent unredeemed claimed reward
    const claimedReward = claimedRewards[claimedRewards.length - 1];
    console.log('✅ Found unredeemed claimed reward:', claimedReward.id);
    
    return NextResponse.json(claimedReward);
    
  } catch (error) {
    console.error("❌ Get claimed reward error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
