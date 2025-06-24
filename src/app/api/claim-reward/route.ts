// src/app/api/claim-reward/route.ts
import { NextResponse } from "next/server";
import { decrementQuantity } from "@/lib/aws-logic"; // whatever you named it
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

    await decrementQuantity(body.cardid); // ✅ Already working
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

    return NextResponse.json({ id: rewardId });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
