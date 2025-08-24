import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET() {
  try {
    const client = generateClient({ authMode: "apiKey" });

    console.log("🔍 Starting to fetch data...");

    // Test 1: Get signups
    console.log("📋 Fetching signups...");
    let signupsResult;
    try {
      signupsResult = await client.graphql({
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
      console.log("✅ Signups fetched successfully with API key");
    } catch (error) {
      console.error("❌ API key failed for signups:", error);
      throw error;
    }

    const signups = (signupsResult as { data: { listSignups: { items: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      status: string;
    }> } } }).data.listSignups.items;

    // Test 2: Get businesses with more details
    console.log("🏢 Fetching businesses...");
    let businessesResult;
    try {
      businessesResult = await client.graphql({
        query: `
          query ListAllBusinesses {
            listBusinesses {
              items {
                id
                name
                phone
                email
                zipCode
                category
                status
                logo
                address
                city
                state
                createdAt
                updatedAt
                approvedAt
              }
            }
          }
        `,
      });
      console.log("✅ Businesses fetched successfully with API key");
    } catch (error) {
      console.error("❌ API key failed for businesses:", error);
      throw error;
    }

    const businesses = (businessesResult as { data: { listBusinesses: { items: Array<{
      id: string;
      name: string;
      phone: string;
      email: string;
      zipCode: string;
      category: string;
      status: string;
      logo: string;
      address: string;
      city: string;
      state: string;
      createdAt: string;
      updatedAt: string;
      approvedAt: string;
    }> } } }).data.listBusinesses.items;

    // Test 3: Get business users for each business
    console.log("👥 Fetching business users...");
    let businessUsersResult;
    try {
      businessUsersResult = await client.graphql({
        query: `
          query ListAllBusinessUsers {
            listBusinessUsers {
              items {
                id
                email
                firstName
                lastName
                role
                status
                businessId
                createdAt
              }
            }
          }
        `,
      });
      console.log("✅ Business users fetched successfully with API key");
    } catch {
      console.log("⚠️ API key failed for business users, trying IAM authentication...");
      // Fallback to IAM authentication
      const iamClient = generateClient({ authMode: "iam" });
      businessUsersResult = await iamClient.graphql({
        query: `
          query ListAllBusinessUsers {
            listBusinessUsers {
              items {
                id
                email
                firstName
                lastName
                role
                status
                businessId
                createdAt
              }
            }
          }
        `,
      });
      console.log("✅ Business users fetched successfully with IAM");
    }

    const businessUsers = (businessUsersResult as { data: { listBusinessUsers: { items: Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      status: string;
      businessId: string;
      createdAt: string;
    }> } } }).data.listBusinessUsers.items;

    // Attach business users to their businesses
    const businessesWithUsers = businesses.map(business => ({
      ...business,
      businessUsers: businessUsers.filter(user => user.businessId === business.id)
    }));

    console.log(`📊 Summary: ${signups.length} signups, ${businessesWithUsers.length} businesses`);

    return NextResponse.json({
      success: true,
      signups: signups,
      businesses: businessesWithUsers,
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