import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import outputs from "../../../../amplify_outputs.json";

// Configure Amplify for server-side usage
Amplify.configure(outputs);

export async function GET() {
  try {
    const client = generateClient({ authMode: "apiKey" });

    // Get all cards to check their address fields
    const result = await client.graphql({
      query: `
        query ListCards {
          listCards {
            items {
              cardid
              header
              subheader
              addressurl
              addresstext
              businessId
              quantity
              expires
              created_at
              duration_hours
            }
          }
        }
      `,
    });

    const cards = (result as { data: { listCards: { items: Array<{
      cardid: string;
      header?: string;
      subheader?: string;
      addressurl?: string;
      addresstext?: string;
      businessId?: string;
      quantity: number;
      expires?: string;
      created_at?: string;
      duration_hours?: number;
    }> } } }).data.listCards.items;

    return NextResponse.json({
      success: true,
      cards: cards,
      totalCards: cards.length,
      cardsWithAddresses: cards.filter(card => card.addressurl && card.addressurl.trim() !== '').length,
      cardsWithoutAddresses: cards.filter(card => !card.addressurl || card.addressurl.trim() === '').length,
    });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
} 