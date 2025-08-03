import { NextRequest, NextResponse } from "next/server";
import { loadPendingUpdates, savePendingUpdates } from "@/lib/pending-updates";
import { generateClient } from "aws-amplify/api";
import "../../../../lib/amplify-client";
import { sendStatusChangeEmail } from "../../../../lib/email-notifications";

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

    // Load current pending updates
    const pendingUpdates = loadPendingUpdates();
    console.log(`📋 Found ${pendingUpdates.length} pending updates`);

    // Find the specific update
    const updateIndex = pendingUpdates.findIndex((update: unknown) => (update as any)?.id === updateId);
    
    if (updateIndex === -1) {
      console.log("❌ Update not found:", updateId);
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    }

    const update = pendingUpdates[updateIndex];
    console.log("✅ Found update:", update);

    if (action === 'approve') {
      // Update the actual business data in the database
      console.log("🔍 Updating business data in database...");
      
      const client = generateClient();
      
      // Get current business data
      const businessResult = await client.graphql({
        query: `
          query GetBusiness($id: String!) {
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
      console.log("🔍 Requested updates:", update.requestedUpdates);

      // Update the business with the new data
      const updateResult = await client.graphql({
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
            ...update.requestedUpdates,
            updatedAt: new Date().toISOString()
          }
        },
      });

      console.log("✅ Business updated in database:", updateResult);
      
      // Mark as approved
      update.status = 'approved';
      update.approvedAt = new Date().toISOString();
      console.log("✅ Update approved and business data updated");
      
      // Send approval email
      try {
        await sendStatusChangeEmail({
          userEmail: update.userEmail,
          businessName: update.businessName,
          userName: `${update.userFirstName} ${update.userLastName}`,
          status: 'update_approved',
        });
      } catch (emailError) {
        console.error("Failed to send update approval email:", emailError);
        // Don't fail the entire request if email fails
      }
    } else {
      // Mark as rejected
      update.status = 'rejected';
      update.rejectedAt = new Date().toISOString();
      console.log("❌ Update rejected");
      
      // Send rejection email
      try {
        await sendStatusChangeEmail({
          userEmail: update.userEmail,
          businessName: update.businessName,
          userName: `${update.userFirstName} ${update.userLastName}`,
          status: 'update_rejected',
          reason: 'Your profile update request did not meet our approval criteria. Please review your changes and ensure all information is accurate and complete.',
        });
      } catch (emailError) {
        console.error("Failed to send update rejection email:", emailError);
        // Don't fail the entire request if email fails
      }
    }

    // Save the updated pending updates
    savePendingUpdates(pendingUpdates);
    
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