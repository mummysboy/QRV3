import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET() {
  try {
    const client = generateClient();

    // Test Signup query
    const signupResult = await client.graphql({
      query: `
        query TestSignup {
          listSignups {
            items {
              id
              firstName
              lastName
              email
              status
            }
          }
        }
      `,
    });

    return NextResponse.json({
      success: true,
      signups: signupResult,
    });
  } catch (error) {
    console.error("Signup test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
} 