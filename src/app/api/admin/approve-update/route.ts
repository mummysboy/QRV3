import { NextRequest, NextResponse } from "next/server";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Admin - Processing update approval/rejection");
    
    const body = await request.json();
    console.log("🔍 Request body:", body);
    
    const { updateId, action } = body;

    if (!updateId || !action) {
      console.log("❌ Missing required fields:", { updateId, action });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      console.log("❌ Invalid action:", action);
      return NextResponse.json({ error: "Invalid action. Must be 'approve' or 'reject'" }, { status: 400 });
    }

    console.log(`📝 Processing ${action} for update: ${updateId}`);

    const client = generateClient({ authMode: "apiKey" });

    // Get the pending update from database
    const updateResult = await client.graphql({
      query: `
        query GetPendingUpdate($id: ID!) {
          getPendingUpdate(id: $id) {
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
      `,
      variables: { id: updateId },
    });

    const update = (updateResult as { data: { getPendingUpdate?: { 
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
    } } }).data.getPendingUpdate;

    if (!update) {
      console.log("❌ Update not found:", updateId);
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    }

    console.log("✅ Found update:", update);

    if (action === 'approve') {
      // Update the actual business data in the database
      console.log("🔍 Updating business data in database...");
      
      // Parse the requested updates
      let requestedUpdates;
      try {
        requestedUpdates = JSON.parse(update.requestedUpdates);
      } catch (error) {
        console.error("❌ Error parsing requested updates:", error);
        return NextResponse.json({ error: "Invalid requested updates format" }, { status: 400 });
      }

      // Get current business data
      const businessResult = await client.graphql({
        query: `
          query GetBusiness($id: ID!) {
            getBusiness(id: $id) {
              id
              name
              address
              city
              state
              zipCode
              category
              phone
              email
              website
              socialMedia
              businessHours
              description
            }
          }
        `,
        variables: {
          id: update.businessId,
        },
      });

      const currentBusiness = (businessResult as { data: { getBusiness: unknown } }).data.getBusiness;
      
      if (!currentBusiness) {
        console.log("❌ Business not found in database");
        return NextResponse.json({ error: "Business not found in database" }, { status: 404 });
      }

      console.log("🔍 Current business data:", currentBusiness);
      console.log("🔍 Requested updates:", requestedUpdates);

      // Update the business with the new data
      const updateBusinessResult = await client.graphql({
        query: `
          mutation UpdateBusiness($input: UpdateBusinessInput!) {
            updateBusiness(input: $input) {
              id
              name
              address
              city
              state
              zipCode
              category
              phone
              email
              website
              socialMedia
              businessHours
              description
              updatedAt
            }
          }
        `,
        variables: {
          input: {
            id: update.businessId,
            ...requestedUpdates,
            updatedAt: new Date().toISOString()
          }
        },
      });

      console.log("✅ Business updated in database:", updateBusinessResult);
      
      // Mark pending update as approved
      await client.graphql({
        query: `
          mutation UpdatePendingUpdate($input: UpdatePendingUpdateInput!) {
            updatePendingUpdate(input: $input) {
              id
              status
              reviewedAt
              reviewedBy
            }
          }
        `,
        variables: {
          input: {
            id: updateId,
            status: 'approved',
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'admin', // TODO: Get actual admin user ID
          }
        },
      });

      console.log("✅ Update approved and business data updated");
    } else {
      // Mark pending update as rejected
      await client.graphql({
        query: `
          mutation UpdatePendingUpdate($input: UpdatePendingUpdateInput!) {
            updatePendingUpdate(input: $input) {
              id
              status
              reviewedAt
              reviewedBy
            }
          }
        `,
        variables: {
          input: {
            id: updateId,
            status: 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'admin', // TODO: Get actual admin user ID
          }
        },
      });

      console.log("❌ Update rejected");
    }
    
    console.log(`✅ Update ${action}ed successfully: ${updateId}`);

    return NextResponse.json({ 
      success: true, 
      message: `Update ${action}ed successfully`,
      updateId,
      action
    });

  } catch (error) {
    console.error("❌ Error processing update action:", error);
    return NextResponse.json(
      { error: "Failed to process update action" },
      { status: 500 }
    );
  }
} 