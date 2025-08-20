import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    console.log("🔍 Debug: Received claim request data:");
    console.log("🔍 Full request body:", JSON.stringify(data, null, 2));
    console.log("🔍 Card ID:", data.cardid);
    console.log("🔍 Email:", data.email);
    console.log("🔍 Phone:", data.phone);
    console.log("🔍 Delivery method:", data.delivery_method);
    console.log("🔍 Is demo:", data.isDemo);
    
    // Return the data for inspection
    return NextResponse.json({
      success: true,
      message: "Request data received and logged",
      receivedData: data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Debug: Error parsing request:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
