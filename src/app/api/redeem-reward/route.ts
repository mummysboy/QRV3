// /src/app/api/redeem-reward/route.ts
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import { Schema } from "../../../../amplify/data/resource";
import outputs from "../../../../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export async function POST(req: Request) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  try {
    await client.models.ClaimedReward.delete({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete reward:", error);
    return NextResponse.json({ error: "Failed to delete reward" }, { status: 500 });
  }
}
