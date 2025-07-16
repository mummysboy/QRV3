import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET() {
  try {
    const client = generateClient();

    // Get all signups
    const signupsResult = await client.graphql({
      query: `
        query ListAllSignups {
          listSignups {
            items {
              id
              firstName
              lastName
              email
              phone
              businessName
              businessAddress
              businessCity
              businessState
              businessZip
              status
              createdAt
            }
          }
        }
      `,
    });

    const signups = (signupsResult as { data: { listSignups: { items: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      businessName: string;
      businessAddress: string;
      businessCity: string;
      businessState: string;
      businessZip: string;
      status: string;
      createdAt: string;
    }> } } }).data.listSignups.items;

    // Get all businesses
    const businessesResult = await client.graphql({
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
              address
              city
              state
              website
              description
              createdAt
              updatedAt
              approvedAt
              approvedBy
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
      website: string;
      description: string;
      createdAt: string;
      updatedAt: string;
      approvedAt: string;
      approvedBy: string;
    }> } } }).data.listBusinesses.items;

    // Get business users for each business
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
                  role
                  status
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
          role: string;
          status: string;
        }> } } }).data.listBusinessUsers.items;

        return {
          ...business,
          businessUsers: users,
        };
      })
    );

    return NextResponse.json({
      success: true,
      signups: signups,
      businesses: businessesWithUsers,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching all signups:", error);
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