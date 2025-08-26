import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function GET() {
  try {
    console.log(`📋 Fetching pending business updates from database`);
    
    const client = generateClient({ authMode: "apiKey" });
    
    // Get all pending updates from database
    const result = await client.graphql({
      query: `
        query ListPendingUpdates {
          listPendingUpdates(filter: {
            status: { eq: "pending" }
          }) {
            items {
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
              reviewedAt
              reviewedBy
              notes
            }
          }
        }
      `
    });

    console.log(`📋 Raw GraphQL result:`, JSON.stringify(result, null, 2));

    const allUpdates = (result as { data: { listPendingUpdates?: { items: Array<{ 
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
      reviewedAt: string; 
      reviewedBy: string; 
      notes: string; 
    }> } } }).data.listPendingUpdates?.items || [];

    console.log(`📋 Database contains ${allUpdates.length} total pending updates`);

    // Filter to only show pending updates (should already be filtered by query, but double-check)
    const pendingUpdates = allUpdates.filter(update => update.status === 'pending');
    console.log(`📋 Found ${pendingUpdates.length} pending updates`);

    // Sort by submission date (newest first)
    pendingUpdates.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    console.log(`✅ Found ${pendingUpdates.length} pending updates from database`);

    return NextResponse.json({ 
      success: true, 
      pendingUpdates 
    });

  } catch (error) {
    console.error("❌ Error fetching pending updates:", error);
    console.error("❌ Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { error: "Failed to fetch pending updates" },
      { status: 500 }
    );
  }
} 