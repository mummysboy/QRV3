import { NextResponse } from "next/server";
import { generateConfiguredClient } from "../../../lib/amplify-client";

export async function GET() {
  try {
    console.log('🧪 Test: Starting business signup test...');
    
    // Test 1: Check if we can generate the client
    console.log('🧪 Test: Generating Amplify client...');
    const client = generateConfiguredClient();
    console.log('🧪 Test: Amplify client generated successfully');
    
    // Test 2: Check if we can make a simple GraphQL query
    console.log('🧪 Test: Testing GraphQL connection...');
    const testQuery = await client.graphql({
      query: `
        query TestConnection {
          listBusinesses(limit: 1) {
            items {
              id
              name
            }
          }
        }
      `
    });
    
    console.log('🧪 Test: GraphQL query successful:', testQuery);
    
    return NextResponse.json({
      success: true,
      message: "Business signup infrastructure is working correctly",
      testResults: {
        clientGenerated: true,
        graphqlConnection: true,
        sampleData: testQuery
      }
    });
    
  } catch (error) {
    console.error('🧪 Test: Error during test:', error);
    
    let errorDetails = "Unknown error";
    if (error instanceof Error) {
      errorDetails = error.message;
    }
    
    return NextResponse.json({
      success: false,
      error: "Business signup infrastructure test failed",
      details: errorDetails
    }, { status: 500 });
  }
}
