import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    const client = generateClient({ authMode: "apiKey" });

    if (email) {
      // Check for specific email in both Signups and BusinessUsers
      const signupResult = await client.graphql({
        query: `
          query GetSignupByEmail($email: String!) {
            listSignups(filter: {
              email: { eq: $email }
            }) {
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
        variables: {
          email: email,
        },
      });

      const businessUserResult = await client.graphql({
        query: `
          query GetBusinessUserByEmail($email: String!) {
            listBusinessUsers(filter: {
              email: { eq: $email }
            }) {
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
        variables: {
          email: email,
        },
      });

      const signups = (signupResult as { data: { listSignups: { items: Array<{
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

      const businessUsers = (businessUserResult as { data: { listBusinessUsers: { items: Array<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
        businessId: string;
        createdAt: string;
      }> } } }).data.listBusinessUsers.items;

      return NextResponse.json({
        success: true,
        email: email,
        signups: signups,
        signupCount: signups.length,
        businessUsers: businessUsers,
        businessUserCount: businessUsers.length,
        totalMatches: signups.length + businessUsers.length,
      });
    } else {
      // Test Signup query for all signups
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
                createdAt
              }
            }
          }
        `,
      });

      return NextResponse.json({
        success: true,
        signups: signupResult,
      });
    }
  } catch (error) {
    console.error("Signup test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
} 