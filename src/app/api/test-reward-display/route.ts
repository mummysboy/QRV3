import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";

const client = generateClient({ authMode: "apiKey" });

export async function GET() {
  try {
    console.log("🧪 Testing reward display flow...");
    
    // Get a sample card from the database
    const cardsResult = await client.graphql({
      query: `
        query ListCards {
          listCards(limit: 1) {
            items {
              cardid
              quantity
              logokey
              header
              subheader
              addressurl
              addresstext
              expires
              businessId
            }
          }
        }
      `,
    });

    const cards = (cardsResult as { data: { listCards: { items: Array<{cardid: string; quantity: number; logokey?: string; header?: string; subheader?: string; addressurl?: string; addresstext?: string; expires?: string; businessId?: string}> } } }).data.listCards.items;
    
    if (cards.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No cards found in database",
        suggestion: "Create a test card first using /api/add-test-card"
      });
    }

    const card = cards[0];
    console.log("📋 Found card:", card);

    // Test logo URL construction logic
    const testLogoUrlConstruction = (logokey: string | null) => {
      if (!logokey) return null;
      
      if (logokey.startsWith("data:") || logokey.startsWith("http")) {
        return logokey;
      }
      
      return logokey.startsWith("/")
        ? `https://d2rfrexwuran49.cloudfront.net${logokey}`
        : `https://d2rfrexwuran49.cloudfront.net/${logokey}`;
    };

    const logoUrl = testLogoUrlConstruction(card.logokey || null);

    // Test if the logo URL is accessible
    let logoAccessible = false;
    let logoError = null;
    
    if (logoUrl) {
      try {
        const response = await fetch(logoUrl, { method: 'HEAD' });
        logoAccessible = response.ok;
        console.log(`🔍 Logo URL ${logoUrl} accessibility: ${response.ok} (${response.status})`);
      } catch (error) {
        logoError = error;
        console.error(`❌ Logo URL ${logoUrl} error:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      card: {
        ...card,
        logoUrl,
        logoAccessible,
        logoError: logoError ? (logoError as Error).message : null
      },
      analysis: {
        hasLogokey: !!card.logokey,
        logokeyType: card.logokey ? (card.logokey.startsWith('http') ? 'full-url' : 's3-key') : 'none',
        willDisplay: !!logoUrl,
        needsFallback: !logoUrl || !logoAccessible
      },
      testUrl: logoUrl,
      bucketName: "qrewards-media6367c-dev",
      region: "us-west-1"
    });
  } catch (error) {
    console.error("❌ Reward display test error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 