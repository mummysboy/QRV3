import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET() {
  try {
    console.log("🧪 Testing GraphQL connection...");
    
    // Test 1: Check amplify client configuration
    console.log("🔧 Checking amplify client configuration...");
    const client = generateClient({ authMode: "apiKey" });
    console.log("✅ GraphQL client created successfully");
    
    // Test 2: Simple query to test basic connectivity
    console.log("🔍 Testing basic GraphQL connectivity...");
    try {
      const testResult = await client.graphql({
        query: `
          query TestConnection {
            __typename
          }
        `,
      });
      console.log("✅ Basic GraphQL query successful:", testResult);
    } catch (basicError) {
      console.error("❌ Basic GraphQL query failed:", basicError);
      throw basicError;
    }
    
    // Test 3: Test Signup query
    console.log("📋 Testing Signup query...");
    try {
      const signupsResult = await client.graphql({
        query: `
          query ListSignups {
            listSignups {
              items {
                id
                firstName
                lastName
                email
              }
            }
          }
        `,
      });
      console.log("✅ Signups query successful:", signupsResult);
    } catch (signupError) {
      console.error("❌ Signups query failed:", signupError);
      throw signupError;
    }
    
    return NextResponse.json({
      success: true,
      message: "All GraphQL tests passed",
    });
    
  } catch (error) {
    console.error("❌ GraphQL test failed:", error);
    
    // Log detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : "Unknown error",
      name: error instanceof Error ? error.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
    };
    
    console.error("Error details:", errorDetails);
    
    return NextResponse.json({
      error: "GraphQL test failed",
      details: errorDetails,
    }, { status: 500 });
  }
} 