import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not provided" },
        { status: 400 }
      );
    }

    const client = generateClient();

    // Get all business users for this email
    const businessUsersResult = await client.graphql({
      query: `
        query GetBusinessUsersByEmail($email: String!) {
          listBusinessUsers(filter: {
            email: { eq: $email }
          }) {
            items {
              id
              businessId
              email
              firstName
              lastName
              role
              status
              createdAt
            }
          }
        }
      `,
      variables: {
        email: userEmail,
      },
    });

    const businessUsers = (businessUsersResult as { data: { listBusinessUsers: { items: Array<{
      id: string;
      businessId: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      status: string;
      createdAt: string;
    }> } } }).data.listBusinessUsers.items;

    if (businessUsers.length === 0) {
      return NextResponse.json({
        success: true,
        businesses: [],
      });
    }

    // Get all businesses for these business IDs
    const businessIds = businessUsers.map(user => user.businessId);
    
    const businessesResult = await client.graphql({
      query: `
        query GetBusinessesByIds($ids: [String!]!) {
          listBusinesses(filter: {
            id: { in: $ids }
          }) {
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
              website
              socialMedia
              businessHours
              description
              photos
              primaryContactEmail
              primaryContactPhone
              createdAt
              updatedAt
              approvedAt
            }
          }
        }
      `,
      variables: {
        ids: businessIds,
      },
    });

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
      website: string;
      socialMedia: string;
      businessHours: string;
      description: string;
      photos: string;
      primaryContactEmail: string;
      primaryContactPhone: string;
      createdAt: string;
      updatedAt: string;
      approvedAt: string;
    }> } } }).data.listBusinesses.items;

    // Combine business data with user role information
    const businessesWithRoles = businesses.map(business => {
      const businessUser = businessUsers.find(user => user.businessId === business.id);
      return {
        ...business,
        userRole: businessUser?.role || 'unknown',
        userStatus: businessUser?.status || 'unknown',
      };
    });

    return NextResponse.json({
      success: true,
      businesses: businessesWithRoles,
    });
  } catch (error) {
    console.error("Error fetching user businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
} 