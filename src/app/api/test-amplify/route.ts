import { NextResponse } from "next/server";
import { generateConfiguredClient } from "../../../lib/amplify-client";

export async function GET() {
  try {
    console.log('🧪 Amplify Test: Starting detailed test...');
    
    // Test 1: Check if we can import and generate the client
    console.log('🧪 Amplify Test: Testing client generation...');
    let client;
    try {
      client = generateConfiguredClient();
      console.log('🧪 Amplify Test: Client generated successfully');
    } catch (clientError) {
      console.error('🧪 Amplify Test: Failed to generate client:', clientError);
      return NextResponse.json({
        success: false,
        error: "Failed to generate Amplify client",
        details: clientError instanceof Error ? clientError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Test 2: Check if we can make a simple GraphQL query
    console.log('🧪 Amplify Test: Testing GraphQL connection...');
    try {
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
      
      console.log('🧪 Amplify Test: GraphQL query successful:', testQuery);
      
      return NextResponse.json({
        success: true,
        message: "Amplify configuration is working correctly",
        testResults: {
          clientGenerated: true,
          graphqlConnection: true,
          sampleData: testQuery
        }
      });
      
    } catch (graphqlError) {
      console.error('🧪 Amplify Test: GraphQL query failed:', graphqlError);
      
      // Check if it's an authorization error
      if (graphqlError && typeof graphqlError === 'object' && 'errors' in graphqlError) {
        const errors = (graphqlError as { errors: unknown }).errors;
        console.error('🧪 Amplify Test: GraphQL errors:', errors);
        
        return NextResponse.json({
          success: false,
          error: "GraphQL authorization failed",
          details: "Check API key configuration",
          graphqlErrors: errors
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: false,
        error: "GraphQL connection failed",
        details: graphqlError instanceof Error ? graphqlError.message : 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('🧪 Amplify Test: Unexpected error:', error);
    
    return NextResponse.json({
      success: false,
      error: "Unexpected error during test",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
