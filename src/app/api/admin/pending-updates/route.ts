import { NextResponse } from "next/server";
import { loadPendingUpdates } from "@/lib/pending-updates";

export async function GET() {
  try {
    console.log(`📋 Fetching pending business updates`);
    
    // Load pending updates from file storage
    const allUpdates = loadPendingUpdates();
    console.log(`📋 Storage contains ${allUpdates.length} total updates`);

    // Filter to only show pending updates
    const pendingUpdates = allUpdates.filter((update: unknown) => (update as any)?.status === 'pending');
    console.log(`📋 Found ${pendingUpdates.length} pending updates`);

    // Sort by submission date (newest first)
    pendingUpdates.sort((a: unknown, b: unknown) => new Date((b as any).submittedAt).getTime() - new Date((a as any).submittedAt).getTime());

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