// src/app/api/claim-reward/route.ts
import { NextResponse } from "next/server";
import { decrementCardQuantity } from "@/lib/aws"; // whatever you named it
import { logClaimedReward } from "@/lib/aws";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const requiredFields = [
      "email",
      "cardid",
      "ip_address",
      "addresstext",
      "addressurl",
      "header",
      "subheader",
      "expires",
      "logokey",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const rewardId = uuidv4(); // You can remove this if DynamoDB generates IDs, but it's best to be explicit

    try {
      console.log("🔄 Decrementing quantity for card:", body.cardid);
      await decrementCardQuantity(body.cardid); // ✅ Already working
      console.log("✅ Successfully decremented quantity");
    } catch (err) {
      console.error("❌ Failed to decrement quantity:", err);
      return NextResponse.json({ error: "Failed to update card quantity" }, { status: 500 });
    }

    try {
      console.log("🔄 Logging claimed reward with ID:", rewardId);
      await logClaimedReward({
        id: rewardId,
        email: body.email,
        cardid: body.cardid,
        ip_address: body.ip_address,
        addresstext: body.addresstext,
        addressurl: body.addressurl,
        header: body.header,
        subheader: body.subheader,
        expires: body.expires,
        logokey: body.logokey,
        claimed_at: new Date().toISOString(),
      });
      console.log("✅ Successfully logged claimed reward");
    } catch (err) {
      console.error("❌ Failed to log reward:", err);
      return NextResponse.json({ error: "Failed to log reward" }, { status: 500 });
    }

    return NextResponse.json({ id: rewardId });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
