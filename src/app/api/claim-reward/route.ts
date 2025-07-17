// src/app/api/claim-reward/route.ts
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import { Schema } from "../../../../amplify/data/resource";
import outputs from "../../../../amplify_outputs.json";

// Configure Amplify for server-side usage with the actual generated outputs
Amplify.configure(outputs);

const client = generateClient<Schema>();

export async function POST(request: Request) {
  console.log("🎯 Claim reward API called");

  try {
    const body = await request.json();
    console.log("📋 Request body:", JSON.stringify(body, null, 2));

    const {
      cardid,
      email,
      addresstext,
      addressurl,
      subheader,
      expires,
      logokey,
      header,
    } = body;

    // ✅ Check required fields
    if (!cardid || !email) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ 1. Get current card and decrement quantity
    try {
      const cardResponse = await client.models.Card.get({ cardid });
      if (!cardResponse.data) {
        return NextResponse.json(
          { error: "Card not found" },
          { status: 404 }
        );
      }

      const card = cardResponse.data;
      if (card.quantity <= 0) {
        return NextResponse.json(
          { error: "Card is out of stock" },
          { status: 400 }
        );
      }

      // Update card quantity
      await client.models.Card.update({
        cardid,
        quantity: card.quantity - 1,
      });
      console.log("✅ Card quantity decremented");
    } catch (error: unknown) {
      console.error("❌ Failed to update card quantity:", error);
      return NextResponse.json(
        { error: "Card is out of stock or invalid" },
        { status: 500 }
      );
    }

    // ✅ 2. Log the claimed reward
    const rewardData = {
      id: `${cardid}-${Date.now()}`,
      cardid,
      email,
      addresstext,
      addressurl,
      subheader,
      expires,
      logokey,
      header,
      claimed_at: new Date().toISOString(),
    };

    try {
      await client.models.ClaimedReward.create(rewardData);
      console.log("✅ Claimed reward logged");
    } catch (error: unknown) {
      console.error("❌ Failed to log reward:", error);
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
