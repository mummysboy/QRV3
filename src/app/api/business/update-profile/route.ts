import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

// Simple test endpoint
export async function GET() {
  try {
    const client = generateClient({ authMode: "apiKey" });
    
    // Get count of pending updates from database
    const result = await client.graphql({
      query: `
        query ListPendingUpdates {
          listPendingUpdates(filter: {
            status: { eq: "pending" }
          }) {
            items {
              id
              businessId
              businessName
              status
              submittedAt
            }
          }
        }
      `
    });

    const pendingUpdates = (result as { data: { listPendingUpdates?: { items: Array<{ 
      id: string; 
      businessId: string; 
      businessName: string; 
      status: string; 
      submittedAt: string; 
    }> } } }).data.listPendingUpdates?.items || [];

    return NextResponse.json({ 
      success: true, 
      message: "Profile update API is working",
      timestamp: new Date().toISOString(),
      pendingUpdatesCount: pendingUpdates.length
    });
  } catch (error) {
    console.error("Error fetching pending updates count:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error fetching pending updates count",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Starting profile update API call");
    console.log("🔍 Request URL:", request.url);
    console.log("🔍 Request method:", request.method);
    
    // Log the raw request
    console.log("🔍 Request headers:", Object.fromEntries(request.headers.entries()));
    
    const body = await request.json();
    console.log("🔍 Request body:", JSON.stringify(body, null, 2));
    
    const { businessId, userEmail, updates } = body;

    if (!businessId || !userEmail || !updates) {
      console.log("❌ Missing required fields:", { businessId, userEmail, updates });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log(`📝 Processing profile update for business: ${businessId}`);

    const client = generateClient({ authMode: "apiKey" });

    // Get current business data to store as currentData
    let currentBusinessResult;
    try {
      currentBusinessResult = await client.graphql({
        query: `
          query GetBusiness($id: ID!) {
            getBusiness(id: $id) {
              id
              name
              phone
              email
              address
              city
              state
              zipCode
              category
              website
              socialMedia
              businessHours
              description
            }
          }
        `,
        variables: { id: businessId },
      });
    } catch (error) {
      console.error("❌ Error fetching current business data:", error);
      return NextResponse.json({ error: "Failed to fetch current business data" }, { status: 500 });
    }

    const currentBusiness = (currentBusinessResult as { data: { getBusiness?: { 
      id: string; 
      name: string; 
      phone: string; 
      email: string; 
      address: string; 
      city: string; 
      state: string; 
      zipCode: string; 
      category: string; 
      website: string; 
      socialMedia: string; 
      businessHours: string; 
      description: string; 
    } } }).data.getBusiness;

    if (!currentBusiness) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Get user information
    let userResult;
    try {
      userResult = await client.graphql({
        query: `
          query GetBusinessUser($email: String!) {
            listBusinessUsers(filter: {
              email: { eq: $email }
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
        variables: { email: userEmail },
      });
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
    }

    const users = (userResult as { data: { listBusinessUsers: { items: Array<{ 
      id: string; 
      firstName: string; 
      lastName: string; 
      email: string; 
    }> } } }).data.listBusinessUsers.items;

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Create pending update in database
    try {
      const result = await client.graphql({
        query: `
          mutation CreatePendingUpdate($input: CreatePendingUpdateInput!) {
            createPendingUpdate(input: $input) {
              id
              businessId
              userEmail
              businessName
              userFirstName
              userLastName
              currentData
              requestedUpdates
              status
              submittedAt
            }
          }
        `,
        variables: {
          input: {
            businessId,
            userEmail,
            businessName: currentBusiness.name,
            userFirstName: user.firstName,
            userLastName: user.lastName,
            currentData: JSON.stringify(currentBusiness),
            requestedUpdates: JSON.stringify(updates),
            status: 'pending',
            submittedAt: new Date().toISOString(),
          },
        },
      });

      const pendingUpdate = (result as { data: { createPendingUpdate: { 
        id: string; 
        businessId: string; 
        userEmail: string; 
        businessName: string; 
        userFirstName: string; 
        userLastName: string; 
        currentData: string; 
        requestedUpdates: string; 
        status: string; 
        submittedAt: string; 
      } } }).data.createPendingUpdate;

      console.log("✅ Pending update created in database:", JSON.stringify(pendingUpdate, null, 2));

      return NextResponse.json({ 
        success: true, 
        message: "Profile update submitted for admin approval",
        updateId: pendingUpdate.id,
        pendingUpdate: pendingUpdate
      });

    } catch (error) {
      console.error("❌ Error creating pending update:", error);
      return NextResponse.json({ error: "Failed to create pending update" }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ Error updating profile:", error);
    console.error("❌ Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
} 