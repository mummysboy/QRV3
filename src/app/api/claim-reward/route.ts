// src/app/api/claim-reward/route.ts
import { NextResponse } from "next/server";
import { decrementCardQuantity, logClaimedReward } from "@/lib/aws";

export async function POST(request: Request) {
  console.log("🎯 Claim reward API called");
  console.log("🔧 Environment check:");
  console.log("🔧 ACCESS_KEY_ID exists:", !!process.env.ACCESS_KEY_ID);
  console.log("🔧 SECRET_ACCESS_KEY exists:", !!process.env.SECRET_ACCESS_KEY);
  console.log("🔧 REGION:", process.env.REGION);

  try {
    const body = await request.json();
    console.log("📋 Request body:", JSON.stringify(body, null, 2));
    
    const { cardid, name, email, phone } = body;

    if (!cardid || !name || !email || !phone) {
      console.error("❌ Missing required fields:", { cardid, name, email, phone });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("➡️ Attempting to decrement card quantity for:", cardid);
    
    // First, try to decrement the card quantity
    try {
      await decrementCardQuantity(cardid);
      console.log("✅ Card quantity decremented successfully");
    } catch (error: any) {
      console.error("❌ Failed to decrement card quantity:", error);
      console.error("❌ Error details:", {
        name: error.name,
        message: error.message,
        code: error.code
      });
      return NextResponse.json(
        { error: "Failed to update card quantity" },
        { status: 500 }
      );
    }

    console.log("➡️ Attempting to log claimed reward");
    
    // Then, log the claimed reward
    const rewardData = {
      id: `${cardid}-${Date.now()}`,
      cardid,
      name,
      email,
      phone,
      claimed_at: new Date().toISOString(),
    };

    try {
      await logClaimedReward(rewardData);
      console.log("✅ Claimed reward logged successfully");
    } catch (error: any) {
      console.error("❌ Failed to log claimed reward:", error);
      return NextResponse.json(
        { error: "Failed to log reward" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reward claimed successfully",
      rewardId: rewardData.id
    });

  } catch (error: any) {
    console.error("❌ Unexpected error in claim-reward API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
