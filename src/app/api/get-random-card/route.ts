// File: /src/app/api/get-random-card/route.ts
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import { Schema } from "../../../../amplify/data/resource";
import outputs from "../../../../amplify_outputs.json";
import { filterExpiredCards } from "@/lib/utils";

console.log("🔧 API Route - Amplify outputs:", JSON.stringify(outputs, null, 2));
console.log("🔧 API Route - Environment variables:");
console.log("🔧 REGION:", process.env.REGION);
console.log("🔧 AWS_REGION:", process.env.AWS_REGION);
console.log("🔧 NODE_ENV:", process.env.NODE_ENV);

// Configure Amplify with the outputs
Amplify.configure(outputs);

// Generate client without explicit credentials (uses IAM roles in production)
const client = generateClient<Schema>();

export async function GET() {
  try {
    console.log("🔍 API Route - Starting get-random-card request");
    
    // Fetch all cards from the Amplify-managed Card table
    const result = await client.models.Card.list();
    const cards = result.data;

    console.log("🔍 API Route - Cards fetched:", cards?.length || 0);

    if (!cards || cards.length === 0) {
      console.log("❌ API Route - No cards available");
      return NextResponse.json({ error: "No cards available" }, { status: 404 });
    }

    // Filter out expired cards
    const validCards = filterExpiredCards(cards);
    
    console.log("🔍 API Route - Valid cards after filtering:", validCards.length);
    
    if (validCards.length === 0) {
      console.log("❌ API Route - No non-expired cards available");
      return NextResponse.json({ error: "No non-expired cards available" }, { status: 404 });
    }

    console.log(`📊 Total cards: ${cards.length}, Non-expired cards: ${validCards.length}`);

    // Pick a random card from non-expired cards
    const card = validCards[Math.floor(Math.random() * validCards.length)];

    console.log("✅ API Route - Selected card:", card.cardid);

    return NextResponse.json(card);
  } catch (err) {
    console.error("❌ API Route - Error fetching random card from DynamoDB:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
