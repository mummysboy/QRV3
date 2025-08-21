import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET() {
  try {
    const client = generateClient({ authMode: "apiKey" });

    // Test Business query
    const businessResult = await client.graphql({
      query: `
        query TestBusiness {
          listBusinesses {
            items {
              id
              name
              email
              status
            }
          }
        }
      `,
    });

    return NextResponse.json({
      success: true,
      businesses: businessResult,
    });
  } catch (error) {
    console.error("Business test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
} 