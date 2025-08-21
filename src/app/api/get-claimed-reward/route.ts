// /src/app/api/get-claimed-reward/route.ts
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import { Schema } from "../../../../amplify/data/resource";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    // This will read from ClaimedReward-7cdlttoiifewxgyh7sodc6czx4-NONE
    // TODO: Re-enable once schema client issues are resolved
    // const result = await client.models.ClaimedReward.get({ id });
    // if (!result.data) {
    //   return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    // }
    // return NextResponse.json(result.data);
    
    return NextResponse.json({ error: "Claimed reward functionality temporarily disabled" }, { status: 503 });
  } catch (error) {
    console.error("Amplify Data error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
