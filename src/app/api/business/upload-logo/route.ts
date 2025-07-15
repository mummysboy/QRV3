import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const logo = formData.get('logo') as File;
    const businessName = formData.get('businessName') as string;

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

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(logo.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a valid image file." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (logo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // For now, we'll use a placeholder URL
    // In a real implementation, you would upload to S3 or similar storage
    const logoUrl = `https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=${encodeURIComponent(businessName.charAt(0))}`;

    // Note: In a real implementation, you would upload to S3 and update the business record
    // For now, we'll return a placeholder logo URL

    return NextResponse.json(
      { 
        success: true, 
        logoUrl: logoUrl,
        message: "Logo uploaded successfully"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    );
  }
} 