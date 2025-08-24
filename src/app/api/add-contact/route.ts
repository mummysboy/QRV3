import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../lib/amplify-client";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();
    
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = generateClient({ authMode: "apiKey" });

    // Create contact using GraphQL mutation
    const result = await client.graphql({
      query: `
        mutation CreateContact($input: CreateContactInput!) {
          createContact(input: $input) {
            id
            name
            email
            message
            createdAt
          }
        }
      `,
      variables: {
        input: {
          name,
          email,
          message,
          createdAt: new Date().toISOString(),
        },
      },
    });

    console.log("✅ Contact created successfully:", result);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("❌ Error creating contact:", error);
    return NextResponse.json({ 
      error: "Failed to save contact",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 