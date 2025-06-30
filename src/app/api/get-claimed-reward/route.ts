// /src/app/api/get-claimed-reward/route.ts
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import { Schema } from "../../../../amplify/data/resource";
import outputs from "../../../../amplify_outputs.json";

// Configure Amplify for server-side usage with the actual generated outputs
Amplify.configure(outputs);

const client = generateClient<Schema>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const result = await client.models.ClaimedReward.get({ id });
    if (!result.data) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    // Transform the data to match the get-random-card format
    const rewardData = result.data;
    console.log("🔍 Raw claimed reward data:", JSON.stringify(rewardData, null, 2));
    
    // Format the response to match get-random-card structure
    const formattedData = {
      cardid: rewardData.cardid,
      header: rewardData.header,
      subheader: rewardData.subheader,
      addresstext: rewardData.addresstext,
      addressurl: rewardData.addressurl,
      expires: rewardData.expires,
      logokey: rewardData.logokey, // This should be the base64 encoded logo
      // Additional fields for claimed rewards
      id: rewardData.id,
      email: rewardData.email,
      claimed_at: rewardData.claimed_at
    };
    
    console.log("🔍 Formatted reward data:", JSON.stringify(formattedData, null, 2));
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Amplify Data error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
