import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("🧪 Test claim API called");
  
  try {
    const body = await request.json();
    console.log("📋 Test request body:", JSON.stringify(body, null, 2));
    
    return NextResponse.json({
      success: true,
      message: "Test claim API working",
      receivedData: body
    });
  } catch (error) {
    console.error("❌ Test API error:", error);
    return NextResponse.json(
      { error: "Test API error" },
      { status: 500 }
    );
  }
} 