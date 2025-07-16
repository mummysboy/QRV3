import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("🔍 Looking up user with email:", email);

    const client = generateClient();

    // Check for business users with this email
    const userResult = await client.graphql({
      query: `
        query GetBusinessUser($email: String!) {
          listBusinessUsers(filter: {
            email: { eq: $email }
          }) {
            items {
              id
              email
              firstName
              lastName
              businessId
              role
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

    const users = (userResult as { data: { listBusinessUsers: { items: Array<{ id: string; email: string; firstName: string; lastName: string; businessId: string; role: string; status: string; createdAt: string }> } } }).data.listBusinessUsers.items;
    
    console.log("🔍 Found users:", users.length);
    console.log("🔍 User details:", JSON.stringify(users, null, 2));

    return NextResponse.json({
      success: true,
      email: email,
      userCount: users.length,
      users: users
    });

  } catch (error) {
    console.error("❌ Error looking up user:", error);
    return NextResponse.json(
      { error: "Failed to look up user", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 