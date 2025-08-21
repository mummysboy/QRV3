// File: /src/app/api/get-random-card/route.ts
// Trigger deployment - API route for getting random cards
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";
import { filterExpiredCards } from "@/lib/utils";

export async function GET() {
  try {
    console.log("🔍 API Route - Starting get-random-card request");
    
    const client = generateClient({ authMode: 'apiKey' });
    
    // Fetch all cards using GraphQL
    const result = await client.graphql({
      query: `
        query ListCards {
          listCards {
            items {
              cardid
              quantity
              logokey
              header
              subheader
              addressurl
              addresstext
              neighborhood
              expires
              businessId
            }
          }
        }
      `
    });

    const cards = result.data.listCards.items;
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
    console.error("❌ API Route - Error fetching random card:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
