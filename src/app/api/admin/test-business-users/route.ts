import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET() {
  try {
    const client = generateClient({ authMode: "apiKey" });

    // Test BusinessUser query
    const businessUsersResult = await client.graphql({
      query: `
        query TestBusinessUsers {
          listBusinessUsers {
            items {
              id
              businessId
              email
              firstName
              lastName
              role
              status
              lastLoginAt
            }
          }
        }
      `,
    });

    return NextResponse.json({
      success: true,
      businessUsers: businessUsersResult,
    });
  } catch (error) {
    console.error("BusinessUsers test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
} 