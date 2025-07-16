import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET() {
  try {
    const client = generateClient();

    console.log("🔍 Starting to fetch data...");

    // Test 1: Get signups
    console.log("📋 Fetching signups...");
    const signupsResult = await client.graphql({
      query: `
        query ListAllSignups {
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

    console.log("✅ Signups fetched successfully");
    const signups = (signupsResult as { data: { listSignups: { items: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      status: string;
    }> } } }).data.listSignups.items;

    // Test 2: Get businesses
    console.log("🏢 Fetching businesses...");
    const businessesResult = await client.graphql({
      query: `
        query ListAllBusinesses {
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

    console.log("✅ Businesses fetched successfully");
    const businesses = (businessesResult as { data: { listBusinesses: { items: Array<{
      id: string;
      name: string;
      email: string;
      status: string;
    }> } } }).data.listBusinesses.items;

    console.log(`📊 Summary: ${signups.length} signups, ${businesses.length} businesses`);

    return NextResponse.json({
      success: true,
      signups: signups,
      businesses: businesses,
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in all-signups-simple:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : typeof error,
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch signups",
        details: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof Error ? error.name : typeof error,
      },
      { status: 500 }
    );
  }
} 