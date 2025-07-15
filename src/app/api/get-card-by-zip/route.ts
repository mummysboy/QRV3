import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import { Schema } from "../../../../amplify/data/resource";
import outputs from "../../../../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>();

// Function to calculate distance between two zip codes
function calculateZipDistance(zip1: string, zip2: string): number {
  // Convert zip codes to numbers for simple distance calculation
  // This is a simplified distance calculation - in a real app you might use
  // a more sophisticated geocoding service for accurate distances
  const num1 = parseInt(zip1.replace(/\D/g, ''), 10);
  const num2 = parseInt(zip2.replace(/\D/g, ''), 10);
  return Math.abs(num1 - num2);
}

// Define types for better type safety
interface CardWithBusiness {
  cardid: string;
  header?: string | null;
  business?: { zipCode: string } | null;
  [key: string]: unknown;
}

interface CardWithDistance extends CardWithBusiness {
  distance: number;
}

// Function to sort cards by zip code distance
function sortCardsByZipDistance(cards: CardWithBusiness[], targetZip: string): CardWithDistance[] {
  return cards.map(card => ({
    ...card,
    distance: calculateZipDistance(card.business?.zipCode || '', targetZip)
  })).sort((a, b) => a.distance - b.distance);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zip');
    
    if (!zipCode) {
      return NextResponse.json({ error: "Zip code parameter is required" }, { status: 400 });
    }

    console.log(`🔍 Fetching cards for zip code: ${zipCode}`);

    // Fetch all cards with their associated business data
    const cardsResult = await client.models.Card.list();
    const cards = cardsResult.data;

    if (!cards || cards.length === 0) {
      return NextResponse.json({ error: "No cards available" }, { status: 404 });
    }

    // Extract zip codes from address text for cards without business associations
    const cardsWithZipCodes = cards.map(card => {
      // Try to extract zip code from addresstext
      const zipCodeMatch = card.addresstext?.match(/\b\d{5}\b/);
      const extractedZipCode = zipCodeMatch ? zipCodeMatch[0] : null;
      
      return {
        ...card,
        business: extractedZipCode ? { zipCode: extractedZipCode } : null
      };
    });

    // Filter out cards without zip codes
    const validCards = cardsWithZipCodes.filter(card => 
      card.business && card.business.zipCode
    ) as CardWithBusiness[];

    if (validCards.length === 0) {
      return NextResponse.json({ error: "No cards with valid business data available" }, { status: 404 });
    }

    // Sort cards by distance from target zip code
    const sortedCards = sortCardsByZipDistance(validCards, zipCode);

    // Find exact matches
    const exactMatches = sortedCards.filter(card => 
      card.business?.zipCode === zipCode
    );

    // Generate random number for probability selection
    const random = Math.random();
    let selectedCard;

    if (random < 0.85 && exactMatches.length > 0) {
      // 85% chance: Pick from exact matches
      console.log(`✅ 85% probability: Selecting from ${exactMatches.length} exact matches`);
      selectedCard = exactMatches[Math.floor(Math.random() * exactMatches.length)];
    } else if (random < 0.95 && sortedCards.length > 1) {
      // 10% chance: Pick the next closest zip code
      console.log(`✅ 10% probability: Selecting next closest zip code`);
      selectedCard = sortedCards[1]; // Second closest (index 1)
    } else if (sortedCards.length > 2) {
      // 5% chance: Pick the 3rd closest zip code
      console.log(`✅ 5% probability: Selecting 3rd closest zip code`);
      selectedCard = sortedCards[2]; // Third closest (index 2)
    } else {
      // Fallback: Pick the closest available
      console.log(`✅ Fallback: Selecting closest available zip code`);
      selectedCard = sortedCards[0];
    }

    // Remove the distance property before returning
    const { distance, ...cardToReturn } = selectedCard;

    console.log(`✅ Selected card: ${cardToReturn.header || 'Unknown'} from zip ${cardToReturn.business?.zipCode || 'Unknown'} (distance: ${distance})`);

    return NextResponse.json(cardToReturn);
  } catch (err) {
    console.error("Error fetching card by zip code:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 