import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET() {
  try {
    const client = generateClient();

    // Test BusinessUser query with password field
    const businessUsersResult = await client.graphql({
      query: `
        query TestBusinessUserPassword {
          listBusinessUsers {
            items {
              id
              businessId
              email
              password
              firstName
              lastName
              role
              status
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
    console.error("BusinessUser password test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
} 