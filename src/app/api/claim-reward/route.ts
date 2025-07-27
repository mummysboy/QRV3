// /src/app/api/claim-reward/route.ts
import { NextResponse } from "next/server";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../../../amplify/data/resource";
import outputs from "../../../../amplify_outputs.json";
import { isCardExpired } from "@/lib/utils";

Amplify.configure(outputs);
const client = generateClient<Schema>();
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
          console.log("🚨 API ROUTE CALLED - POST /api/claim-reward");
    console.log("🎯 Claim reward API called");

    try {
            const data = await req.json();
      console.log("📋 Request body:", JSON.stringify(data, null, 2));

      const {
        cardid,
        email,
        phone,
        delivery_method,
        addresstext,
        addressurl,
        subheader,
        expires,
        logokey,
        header,
        isDemo,
      } = data;
      
      console.log("🎯 Demo mode:", isDemo ? "YES" : "NO");

    if (!cardid || (!email && !phone)) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ 1. Get current card and decrement quantity (skip for demo)
    let card: { quantity: number; businessId?: string | null; expires?: string | null } | null = null;
    if (!isDemo) {
      try {
        console.log("🔍 Attempting to get card with cardid:", cardid);
        const cardResponse = await client.models.Card.get({ cardid });
        console.log("🔍 Card response:", JSON.stringify(cardResponse, null, 2));
        
        if (!cardResponse.data) {
          console.error("❌ Card not found:", cardid);
          return NextResponse.json(
            { error: "Card not found" },
            { status: 404 }
          );
        }

        card = cardResponse.data;
        console.log("🔍 Found card:", JSON.stringify(card, null, 2));
        
        // Check if card is expired
        if (card && card.expires && isCardExpired(card.expires)) {
          console.error("❌ Card is expired:", cardid);
          return NextResponse.json(
            { error: "Card has expired" },
            { status: 400 }
          );
        }
        
        if (card && card.quantity <= 0) {
          console.error("❌ Card is out of stock. Current quantity:", card.quantity);
          return NextResponse.json(
            { error: "Card is out of stock" },
            { status: 400 }
          );
        }

        console.log("🔍 Updating card quantity from", card.quantity, "to", card.quantity - 1);
        // Update card quantity
        const updateResponse = await client.models.Card.update({
          cardid,
          quantity: card.quantity - 1,
        });
        console.log("✅ Card quantity update response:", JSON.stringify(updateResponse, null, 2));
        console.log("✅ Card quantity decremented");
      } catch (error: unknown) {
        console.error("❌ Failed to update card quantity. Error details:", error);
        console.error("❌ Error type:", typeof error);
        console.error("❌ Error message:", error instanceof Error ? error.message : String(error));
        console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace");
        return NextResponse.json(
          { error: "Card is out of stock or invalid" },
          { status: 500 }
        );
      }
    } else {
      console.log("🎯 Demo mode: Skipping card quantity decrement");
    }

    // ✅ 2. Log the claimed reward
    const rewardData = {
      id: `${cardid}-${Date.now()}`,
      cardid,
      email: delivery_method === "email" ? email : "",
      phone: delivery_method === "sms" ? phone : "",
      delivery_method,
      addresstext,
      addressurl,
      subheader: isDemo ? "Demo Mode: You've successfully claimed this reward! Click 'Redeem Reward' below to experience how your customers will complete the redemption process." : subheader,
      expires: expires, // Keep the original expiration date even for demo
      logokey,
      header,
      claimed_at: new Date().toISOString(),
      businessId: card?.businessId || "", // Include business ID from the card
    };

    console.log("🔍 Creating claimed reward with data:", JSON.stringify(rewardData, null, 2));

    try {
      const createResponse = await client.models.ClaimedReward.create(rewardData);
      console.log("✅ Claimed reward creation response:", JSON.stringify(createResponse, null, 2));
      console.log("✅ Claimed reward logged");
    } catch (error: unknown) {
      console.error("❌ Failed to log reward. Error details:", error);
      console.error("❌ Error type:", typeof error);
      console.error("❌ Error message:", error instanceof Error ? error.message : String(error));
      console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace");
      return NextResponse.json(
        { error: "Failed to log reward" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reward claimed successfully",
      rewardId: rewardData.id,
    });
  } catch (error: unknown) {
    console.error("❌ Unexpected server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
