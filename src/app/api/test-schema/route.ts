import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";

export async function GET() {
  try {
    console.log('🧪 Testing new schema...');
    
    const client = generateClient({ authMode: "apiKey" });
    
    // Test 1: List all businesses
    try {
      const businessesResult = await client.graphql({
        query: `
          query ListBusinesses {
            listBusinesses {
              items {
                id
                id
                name
                status
                email
              }
            }
          }
        `,
      });
      
      console.log('✅ Businesses found:', businessesResult);
      
      // Test 2: List all business users
      const usersResult = await client.graphql({
        query: `
          query ListBusinessUsers {
            listBusinessUsers {
              items {
                id
                email
                businessId
                status
              }
            }
          }
        `,
      });
      
      console.log('✅ Business users found:', usersResult);
      
      return NextResponse.json({ 
        success: true,
        businesses: businessesResult.data.listBusinesses.items,
        businessUsers: usersResult.data.listBusinessUsers.items,
        message: "Schema test completed"
      });
      
    } catch (error) {
      console.log('❌ Schema test failed:', error);
      return NextResponse.json({ 
        success: false,
        error: "Schema test failed",
        details: error
      });
    }
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: "Test failed", details: error }, { status: 500 });
  }
}
