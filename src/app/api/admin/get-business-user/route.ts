import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

interface GetBusinessUserData {
  businessId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId }: GetBusinessUserData = body;

    // Validate required fields
    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Get business users for this business
    const result = await client.graphql({
      query: `
        query GetBusinessUsers($businessId: String!) {
          listBusinessUsers(filter: {
            businessId: { eq: $businessId }
          }) {
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
      variables: {
        businessId: businessId,
      },
    });

    const users = (result as { data: { listBusinessUsers: { items: Array<{
      id: string;
      businessId: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      status: string;
      lastLoginAt?: string;
    }> } } }).data.listBusinessUsers.items;

    // Get the first active user
    const activeUser = users.find(user => user.status === 'active');

    if (!activeUser) {
      return NextResponse.json(
        { error: "No active business user found for this business" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Business user found",
        user: {
          id: activeUser.id,
          email: activeUser.email,
          firstName: activeUser.firstName,
          lastName: activeUser.lastName,
          role: activeUser.role,
          status: activeUser.status,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting business user:", error);
    return NextResponse.json(
      { error: "Failed to get business user" },
      { status: 500 }
    );
  }
} 