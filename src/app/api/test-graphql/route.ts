import { NextRequest, NextResponse } from "next/server";
import { generateConfiguredClient } from "../../../lib/amplify-client";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Test GraphQL API called");
    
    // Initialize the configured client
    const client = generateConfiguredClient();
    console.log("🔍 Client initialized successfully");
    
    // Test a simple GraphQL query
    console.log("🔍 Testing simple GraphQL query...");
    const result = await client.graphql({
      query: `
        query TestQuery {
          listBusinesses(limit: 1) {
            items {
              id
              name
            }
          }
        }
      `
    });
    
    console.log("🔍 GraphQL query successful");
    console.log("🔍 Result:", JSON.stringify(result, null, 2));
    
    return NextResponse.json({
      success: true,
      message: "GraphQL connection successful",
      result: result
    });
    
  } catch (error) {
    console.error("🔍 GraphQL test error:", error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error("🔍 Error message:", error.message);
      console.error("🔍 Error stack:", error.stack);
    }
    
    // Check if it's a GraphQL error
    if (error && typeof error === 'object' && 'errors' in error) {
      console.error("🔍 GraphQL errors:", (error as { errors: unknown }).errors);
    }
    
    // Check if it's a network error
    if (error && typeof error === 'object' && 'networkError' in error) {
      console.error("🔍 Network error:", (error as { networkError: unknown }).networkError);
    }
    
    return NextResponse.json({
      success: false,
      error: "GraphQL test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
