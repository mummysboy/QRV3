import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

// Simple file-based storage for pending updates
const STORAGE_FILE = join(process.cwd(), 'pending-updates.json');

// Helper functions for storage
const loadPendingUpdates = () => {
  try {
    if (existsSync(STORAGE_FILE)) {
      const data = readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log("⚠️ Could not load pending updates file:", error);
  }
  return [];
};

const savePendingUpdates = (updates: any[]) => {
  try {
    writeFileSync(STORAGE_FILE, JSON.stringify(updates, null, 2));
    console.log(`✅ Saved ${updates.length} pending updates to file`);
  } catch (error) {
    console.log("⚠️ Could not save pending updates file:", error);
  }
};

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

// Export the storage functions for other APIs to access
export { loadPendingUpdates, savePendingUpdates }; 