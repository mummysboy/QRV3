import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";

interface GraphQLResult<T> {
  data: T;
}

export async function GET() {
  try {
    console.log("🔍 Testing GraphQL connectivity...");
    
    const client = generateClient({ authMode: 'apiKey' });

    // Test 1: Test basic GraphQL connectivity by listing businesses
    console.log("🔍 Testing GraphQL business query...");
    const businessesResult = await client.graphql({
      query: `
        query TestBusinesses {
          listBusinesses(limit: 1) {
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
    
    const businesses = (businessesResult as GraphQLResult<any>).data.listBusinesses.items;
    console.log("✅ Successfully queried businesses:", businesses.length);

    // Test 2: Test other models to ensure they're accessible
    console.log("🔍 Testing other models...");
    
    // Test Cards
    const cardsResult = await client.graphql({
      query: `
        query TestCards {
          listCards(limit: 1) {
            items {
              cardid
              quantity
              businessId
            }
          }
        }
      `,
    });
    const cards = (cardsResult as GraphQLResult<any>).data.listCards.items;
    console.log("✅ Successfully queried cards:", cards.length);

    // Test ClaimedRewards
    const claimedRewardsResult = await client.graphql({
      query: `
        query TestClaimedRewards {
          listClaimedRewards(limit: 1) {
            items {
              id
              cardid
              email
            }
          }
        }
      `,
    });
    const claimedRewards = (claimedRewardsResult as GraphQLResult<any>).data.listClaimedRewards.items;
    console.log("✅ Successfully queried claimed rewards:", claimedRewards.length);

    // Test BusinessUsers
    const businessUsersResult = await client.graphql({
      query: `
        query TestBusinessUsers {
          listBusinessUsers(limit: 1) {
            items {
              id
              email
              businessId
            }
          }
        }
      `,
    });
    const businessUsers = (businessUsersResult as GraphQLResult<any>).data.listBusinessUsers.items;
    console.log("✅ Successfully queried business users:", businessUsers.length);

    // Test Signups
    const signupsResult = await client.graphql({
      query: `
        query TestSignups {
          listSignups(limit: 1) {
            items {
              id
              email
              businessName
            }
          }
        }
      `,
    });
    const signups = (signupsResult as GraphQLResult<any>).data.listSignups.items;
    console.log("✅ Successfully queried signups:", signups.length);

    // Test Contacts
    const contactsResult = await client.graphql({
      query: `
        query TestContacts {
          listContacts(limit: 1) {
            items {
              id
              email
              name
            }
          }
        }
      `,
    });
    const contacts = (contactsResult as GraphQLResult<any>).data.listContacts.items;
    console.log("✅ Successfully queried contacts:", contacts.length);

    return NextResponse.json({
      success: true,
      message: "GraphQL connection test successful",
      results: {
        businesses: businesses.length,
        cards: cards.length,
        claimedRewards: claimedRewards.length,
        businessUsers: businessUsers.length,
        signups: signups.length,
        contacts: contacts.length,
      },
      region: process.env.REGION || "us-west-1"
    });

  } catch (error: any) {
    console.error("❌ GraphQL connection test failed:", error);
    
    // Provide specific error details
    let errorType = "Unknown";
    const errorMessage = error.message || "Unknown error";
    
    if (error.name === "GraphQLError") {
      errorType = "GraphQL Error";
    } else if (error.name === "NetworkError") {
      errorType = "Network Error";
    } else if (error.name === "UnauthorizedError") {
      errorType = "Unauthorized - check API key";
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      errorType: errorType,
      errorName: error.name,
      region: process.env.REGION || "us-west-1"
    }, { status: 500 });
  }
}
