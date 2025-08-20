// File: /src/app/api/get-random-card/route.ts
// Updated to use direct DynamoDB access instead of broken GraphQL
import { NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { filterExpiredCards } from "@/lib/utils";

console.log("🔧 API Route - Using direct DynamoDB access");
console.log("🔧 API Route - Environment variables:");
console.log("🔧 REGION:", process.env.REGION);
console.log("🔧 AWS_REGION:", process.env.AWS_REGION);
console.log("🔧 NODE_ENV:", process.env.NODE_ENV);

// Create DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.REGION || "us-west-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    console.log("🔍 API Route - Starting get-random-card request");
    
    // Scan the Card table directly from DynamoDB
    const scanCommand = new ScanCommand({
      TableName: "Card-7cdlttoiifewxgyh7sodc6czx4-NONE", // Use the actual table name from your account
      Limit: 100 // Get up to 100 cards
    });
    
    const result = await dynamoClient.send(scanCommand);
    const cards = result.Items?.map(item => unmarshall(item)) || [];

    console.log("🔍 API Route - Cards fetched:", cards.length);

    if (!cards || cards.length === 0) {
      console.log("❌ API Route - No cards available");
      return NextResponse.json({ error: "No cards available" }, { status: 404 });
    }

    // Filter out expired cards and cards with quantity <= 0
    const validCards = filterExpiredCards(cards).filter(card => card.quantity > 0);
    
    console.log("🔍 API Route - Valid cards after filtering:", validCards.length);
    
    if (validCards.length === 0) {
      console.log("❌ API Route - No available cards (all expired or out of stock)");
      return NextResponse.json({ error: "No available cards (all expired or out of stock)" }, { status: 404 });
    }

    console.log(`📊 Total cards: ${cards.length}, Available cards: ${validCards.length}`);

    // Pick a random card from available cards
    const card = validCards[Math.floor(Math.random() * validCards.length)];

    console.log("✅ API Route - Selected card:", card.cardid);

    return NextResponse.json(card);
  } catch (err) {
    console.error("❌ API Route - Error fetching random card from DynamoDB:", err);
    return NextResponse.json({ 
      error: "Server error", 
      details: err instanceof Error ? err.message : "Unknown error" 
    }, { status: 500 });
  }
}
