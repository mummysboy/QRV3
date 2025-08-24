// File: /src/app/api/claim-reward/route.ts
// Trigger deployment - API route for claiming rewards
import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardid, email, phone, delivery_method } = body;

    if (!cardid) {
      return NextResponse.json(
        { error: "Card ID is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Claim reward request received:", { cardid, email, phone, delivery_method });

    const client = generateClient({ authMode: 'apiKey' });

    // Get the card details
    const cardResponse = await client.graphql({
      query: `
        query GetCard($cardid: String!) {
          getCard(cardid: $cardid) {
            cardid
            quantity
            logokey
            header
            subheader
            addressurl
            addresstext
            neighborhood
            expires
            businessId
          }
        }
      `,
      variables: { cardid }
    });

    const card = (cardResponse as any).data.getCard;
    console.log("🔍 Card response:", JSON.stringify(cardResponse, null, 2));
    
    if (!card) {
      console.error("❌ Card not found:", cardid);
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    console.log("🔍 Found card:", JSON.stringify(card, null, 2));
    
    // Check if card has quantity
    if (card.quantity <= 0) {
      console.error("❌ Card has no quantity left:", cardid);
      return NextResponse.json(
        { error: "This reward is no longer available" },
        { status: 400 }
      );
    }

    try {
      console.log("🔍 Updating card quantity from", card.quantity, "to", card.quantity - 1);
      // Update card quantity
      const updateResponse = await client.graphql({
        query: `
          mutation UpdateCard($input: UpdateCardInput!) {
            updateCard(input: $input) {
              cardid
              quantity
            }
          }
        `,
        variables: { 
          input: { 
            cardid, 
            quantity: card.quantity - 1 
          } 
        }
      });
      console.log("✅ Card quantity update response:", JSON.stringify(updateResponse, null, 2));
    } catch (updateError) {
      console.error("❌ Failed to update card quantity:", updateError);
      return NextResponse.json(
        { error: "Failed to update card quantity" },
        { status: 500 }
      );
    }

    // Prepare reward data
    const rewardData = {
      id: `${cardid}-${Date.now()}`,
      cardid,
      email: email || "",
      phone: phone || "",
      delivery_method: delivery_method || "email",
      logokey: card.logokey || "",
      header: card.header || "",
      subheader: card.subheader || "",
      addressurl: card.addressurl || "",
      addresstext: card.addresstext || "",
      expires: card.expires || "",
      claimed_at: new Date().toISOString(),
      businessId: card.businessId || "",
    };

    console.log("🔍 Creating claimed reward with data:", JSON.stringify(rewardData, null, 2));

    try {
      const createResponse = await client.graphql({
        query: `
          mutation CreateClaimedReward($input: CreateClaimedRewardInput!) {
            createClaimedReward(input: $input) {
              id
            }
          }
        `,
        variables: { input: rewardData }
      });
      console.log("✅ Claimed reward creation response:", JSON.stringify(createResponse, null, 2));
      console.log("✅ Claimed reward logged");
    } catch (createError) {
      console.error("❌ Failed to create claimed reward:", createError);
      // Don't fail the whole request if logging fails
    }

    return NextResponse.json({
      success: true,
      message: "Reward claimed successfully",
      card: {
        cardid: card.cardid,
        header: card.header,
        subheader: card.subheader,
        logokey: card.logokey,
        addressurl: card.addressurl,
        addresstext: card.addresstext,
        neighborhood: card.neighborhood,
      },
    });
  } catch (error) {
    console.error("❌ Error claiming reward:", error);
    return NextResponse.json(
      { error: "Failed to claim reward" },
      { status: 500 }
    );
  }
}
