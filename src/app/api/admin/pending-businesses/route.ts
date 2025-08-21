import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET() {
  try {
    const client = generateClient({ authMode: "apiKey" });

    // Get all pending businesses
    const businessesResult = await client.graphql({
      query: `
        query ListPendingBusinesses {
          listBusinesses(filter: {
            status: { eq: "pending_approval" }
          }) {
            items {
              id
              name
              phone
              email
              zipCode
              category
              status
              address
              city
              state
              createdAt
            }
          }
        }
      `,
    });

    const businesses = (businessesResult as { data: { listBusinesses: { items: Array<{ 
      id: string; 
      name: string; 
      phone: string; 
      email: string; 
      zipCode: string; 
      category: string; 
      status: string; 
      address: string; 
      city: string; 
      state: string; 
      createdAt: string; 
    }> } } }).data.listBusinesses.items;

    // For each business, get the associated business users
    const businessesWithUsers = await Promise.all(
      businesses.map(async (business) => {
        const usersResult = await client.graphql({
          query: `
            query GetBusinessUsers($businessId: String!) {
              listBusinessUsers(filter: {
                businessId: { eq: $businessId }
              }) {
                items {
                  id
                  firstName
                  lastName
                  email
                }
              }
            }
          `,
          variables: {
            businessId: business.id,
          },
        });

        const users = (usersResult as { data: { listBusinessUsers: { items: Array<{ 
          id: string; 
          firstName: string; 
          lastName: string; 
          email: string; 
        }> } } }).data.listBusinessUsers.items;

        return {
          ...business,
          businessUsers: users,
        };
      })
    );

    return NextResponse.json(
      { 
        success: true, 
        businesses: businessesWithUsers 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching pending businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending businesses" },
      { status: 500 }
    );
  }
} 