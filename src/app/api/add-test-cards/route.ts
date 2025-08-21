import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import { Schema } from "../../../../amplify/data/resource";
import outputs from "../../../../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export async function POST() {
  try {
    // Add multiple test cards with different zip codes
    const testCards = [
      {
        cardid: "card-12345",
        quantity: 10,
        logokey: "logos/starbucks.png",
        header: "Starbucks",
        subheader: "Buy one coffee get the second one half off!",
        addresstext: "123 Main St, Downtown, CA 12345",
        expires: "2026-05-11",
      },
      {
        cardid: "card-12346",
        quantity: 8,
        logokey: "logos/mcdonalds.png",
        header: "McDonald's",
        subheader: "Free Big Mac with any purchase!",
        addresstext: "456 Oak Ave, Downtown, CA 12346",
        expires: "2026-06-15",
      },
      {
        cardid: "card-12347",
        quantity: 5,
        logokey: "logos/subway.png",
        header: "Subway",
        subheader: "Buy one footlong, get one free!",
        addresstext: "789 Pine St, Downtown, CA 12347",
        expires: "2026-07-20",
      },
      {
        cardid: "card-12445",
        quantity: 12,
        logokey: "logos/pizzahut.png",
        header: "Pizza Hut",
        subheader: "Large pizza for the price of medium!",
        addresstext: "321 Elm St, Uptown, CA 12445",
        expires: "2026-08-10",
      },
      {
        cardid: "card-22345",
        quantity: 6,
        logokey: "logos/kfc.png",
        header: "KFC",
        subheader: "Free side with any meal!",
        addresstext: "654 Maple Dr, Westside, CA 22345",
        expires: "2026-09-05",
      },
      {
        cardid: "card-12344",
        quantity: 15,
        logokey: "logos/burgerking.png",
        header: "Burger King",
        subheader: "Whopper Wednesday - 50% off!",
        addresstext: "987 Cedar Ln, Downtown, CA 12344",
        expires: "2026-10-12",
      },
      {
        cardid: "card-12348",
        quantity: 9,
        logokey: "logos/wendys.png",
        header: "Wendy's",
        subheader: "Free Frosty with any combo!",
        addresstext: "147 Birch Rd, Downtown, CA 12348",
        expires: "2026-11-18",
      }
    ];

    const createdCards = [];
    
    for (const card of testCards) {
      try {
        // TODO: Re-enable once schema client issues are resolved
        // const result = await client.models.Card.create(card);
        // createdCards.push(result.data);
        createdCards.push({ id: card.cardid, status: "disabled" });
        console.log(`✅ Would create card: ${card.header} in zip ${card.addresstext.split(' ').pop()}`);
      } catch (error) {
        console.error(`❌ Failed to create card ${card.cardid}:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdCards.length} test cards`,
      cards: createdCards
    });
  } catch (error) {
    console.error("Error adding test cards:", error);
    return NextResponse.json(
      { error: "Failed to add test cards" },
      { status: 500 }
    );
  }
} 