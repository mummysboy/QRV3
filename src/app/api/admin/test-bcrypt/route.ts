import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    console.log("🔍 Testing bcrypt with password:", password ? "***" : "undefined");

    // Test with the known hash from the database
    const knownHash = "$2b$10$4Fb9JnvwSL16t4qn0/AHMe180K6kRGmS6b/iGr.b5/K4C1fITAnEy";
    
    console.log("🔐 Comparing with known hash...");
    const isValid = await bcrypt.compare(password, knownHash);
    console.log("✅ Password valid:", isValid);

    return NextResponse.json({
      success: true,
      passwordProvided: !!password,
      isValid: isValid,
    });
  } catch (error) {
    console.error("❌ Bcrypt test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
} 