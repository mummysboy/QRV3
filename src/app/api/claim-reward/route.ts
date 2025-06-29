// src/app/api/claim-reward/route.ts
import { NextResponse } from "next/server";
import { decrementCardQuantity, logClaimedReward } from "@/lib/aws";

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

    // ✅ 1. Decrement card quantity
    try {
      await decrementCardQuantity(cardid);
      console.log("✅ Card quantity decremented");
    } catch (error: unknown) {
      console.error("❌ Failed to decrement quantity:", error);
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
      await logClaimedReward(rewardData);
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
