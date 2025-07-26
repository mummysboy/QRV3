import { NextResponse } from "next/server";
import { loadPendingUpdates } from "../../business/update-profile/route";

export async function GET() {
  try {
    console.log(`📋 Fetching pending business updates`);
    
    // Load pending updates from file storage
    const allUpdates = loadPendingUpdates();
    console.log(`📋 Storage contains ${allUpdates.length} total updates`);

    // Filter to only show pending updates
    const pendingUpdates = allUpdates.filter(update => update.status === 'pending');
    console.log(`📋 Found ${pendingUpdates.length} pending updates`);

    // Sort by submission date (newest first)
    pendingUpdates.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    console.log(`✅ Found ${pendingUpdates.length} pending updates`);

    return NextResponse.json({ 
      success: true, 
      pendingUpdates 
    });

  } catch (error) {
    console.error("❌ Error fetching pending updates:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending updates" },
      { status: 500 }
    );
  }
} 