// File: /src/app/api/get-random-card/route.ts
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import { Schema } from "../../../../amplify/data/resource";
import outputs from "../../../../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export async function GET() {
  try {
    // Fetch all cards from the Amplify-managed Card table
    const result = await client.models.Card.list();
    const cards = result.data;

    if (!cards || cards.length === 0) {
      return NextResponse.json({ error: "No cards available" }, { status: 404 });
    }

    // Pick a random card
    const card = cards[Math.floor(Math.random() * cards.length)];

    return NextResponse.json(card);
  } catch (err) {
    console.error("Error fetching random card from DynamoDB:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
