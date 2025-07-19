import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test logo upload: Starting test...');
    
    const formData = await request.formData();
    const logo = formData.get('logo') as File;
    const businessName = formData.get('businessName') as string;

    console.log('🧪 Test logo upload: File received:', {
      name: logo?.name,
      type: logo?.type,
      size: logo?.size,
      businessName
    });

    // Test file validation
    if (!logo) {
      return NextResponse.json(
        { error: "No logo file provided" },
        { status: 400 }
      );
    }

    if (!businessName) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    // Test file size
    if (logo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Test file type detection
    const fileType = logo.type;
    const fileName = logo.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    console.log('🧪 Test logo upload: File analysis:', {
      mimeType: fileType,
      fileName,
      fileExtension,
      size: logo.size
    });

    return NextResponse.json({
      success: true,
      message: "File validation passed",
      fileInfo: {
        name: fileName,
        type: fileType,
        size: logo.size,
        extension: fileExtension
      },
      businessName
    });

  } catch (error) {
    console.error("🧪 Test logo upload: Error:", error);
    
    return NextResponse.json(
      { 
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Logo upload test endpoint is working",
    timestamp: new Date().toISOString()
  });
} 