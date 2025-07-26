import { NextRequest, NextResponse } from "next/server";
import { loadPendingUpdates, savePendingUpdates } from "@/lib/pending-updates";

// Simple test endpoint
export async function GET() {
  const pendingUpdates = loadPendingUpdates();
  return NextResponse.json({ 
    success: true, 
    message: "Profile update API is working",
    timestamp: new Date().toISOString(),
    pendingUpdatesCount: pendingUpdates.length
  });
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

    // For now, create a simple pending update record
    // We'll store this in a way that the admin dashboard can find it
    const pendingUpdate = {
      id: `update_${businessId}_${Date.now()}`,
      businessId,
      userEmail,
      businessName: "State Street Crossfit", // We'll get this from the actual business data later
      userFirstName: "Isaac",
      userLastName: "Hirsch",
      currentData: {},
      requestedUpdates: updates,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    console.log("📝 Pending update created:", JSON.stringify(pendingUpdate, null, 2));
    
    // Load existing updates and add the new one
    const existingUpdates = loadPendingUpdates();
    existingUpdates.push(pendingUpdate);
    savePendingUpdates(existingUpdates);
    
    console.log(`✅ Profile update stored in file. Total pending updates: ${existingUpdates.length}`);

    return NextResponse.json({ 
      success: true, 
      message: "Profile update submitted for admin approval",
      updateId: pendingUpdate.id,
      pendingUpdate: pendingUpdate // Include the data for testing
    });

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

// Note: Storage functions are internal to this route and not exported
// Other routes should implement their own storage logic if needed 