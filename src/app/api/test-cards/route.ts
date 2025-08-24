import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";

export async function GET() {
  try {
    console.log('🧪 Testing cards and claimed rewards...');
    
    const client = generateClient({ authMode: "apiKey" });
    
    // Test 1: List all cards
    try {
      const cardsResult = await client.graphql({
        query: `
          query ListCards {
            listCards {
              items {
                cardid
                header
                subheader
                quantity
                neighborhood
                businessId
                expires
              }
            }
          }
        `,
      });
      
      console.log('✅ Cards found:', cardsResult);
      
      // Test 2: List all claimed rewards
      const claimedResult = await client.graphql({
        query: `
          query ListClaimedRewards {
            listClaimedRewards {
              items {
                id
                cardid
                email
                phone
                delivery_method
                claimed_at
                businessId
              }
            }
          }
        `,
      });
      
      console.log('✅ Claimed rewards found:', claimedResult);
      
      return NextResponse.json({ 
        success: true,
        cards: cardsResult.data.listCards.items,
        claimedRewards: claimedResult.data.listClaimedRewards.items,
        message: "Cards test completed"
      });
      
    } catch (error) {
      console.log('❌ Cards test failed:', error);
      return NextResponse.json({ 
        success: false,
        error: "Cards test failed",
        details: error
      });
    }
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: "Test failed", details: error }, { status: 500 });
  }
}
