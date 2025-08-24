import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client"; // Import the configured Amplify client

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    
    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    console.log('🧪 Testing if business exists:', businessId);
    
    const client = generateClient({ authMode: "apiKey" });
    
    // Test 1: Try to get the specific business
    try {
      const businessResult = await client.graphql({
        query: `
          query GetBusiness($id: ID!) {
            getBusiness(id: $id) {
              id
              name
              status
            }
          }
        `,
        variables: { id: businessId },
      });
      
      console.log('✅ Business found:', businessResult);
      return NextResponse.json({ 
        exists: true, 
        business: businessResult.data.getBusiness 
      });
    } catch (error) {
      console.log('❌ Business not found:', error);
      
      // Test 2: List all businesses to see what exists
      try {
        const listResult = await client.graphql({
          query: `
            query ListBusinesses {
              listBusinesses {
                items {
                  id
                  name
                  status
                }
              }
            }
          `,
        });
        
        console.log('📋 All businesses:', listResult);
        return NextResponse.json({ 
          exists: false, 
          error: "Business not found",
          allBusinesses: listResult.data.listBusinesses.items,
          searchedFor: businessId
        });
      } catch (listError) {
        console.log('❌ Failed to list businesses:', listError);
        return NextResponse.json({ 
          exists: false, 
          error: "Business not found and failed to list businesses",
          listError: listError
        });
      }
    }
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: "Test failed", details: error }, { status: 500 });
  }
}
