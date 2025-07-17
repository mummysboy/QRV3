import { NextRequest, NextResponse } from "next/server";
import { uploadData } from 'aws-amplify/storage';
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

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

    // Validate file size (max 5MB)
    if (logo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const inputBuffer = Buffer.from(await logo.arrayBuffer());

    // Use sharp to process the image: auto-orient, resize, convert to PNG
    let processedBuffer;
    try {
      processedBuffer = await sharp(inputBuffer)
        .rotate() // auto-orient based on EXIF
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer();
    } catch {
      return NextResponse.json(
        { error: "Failed to process image. Please upload a valid image file." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileName = `logos/${businessName.replace(/[^a-zA-Z0-9]/g, '-')}-${uuidv4()}.png`;

    // Upload using Amplify Storage
    const result = await uploadData({
      key: fileName,
      data: processedBuffer,
      options: {
        contentType: 'image/png',
      }
    });

    // Get the URL for the uploaded file
    const logoUrl = await result.result;

    console.log('Logo uploaded successfully:', {
      fileName,
      logoUrl,
      businessName,
      fileSize: logo.size,
      contentType: logo.type
    });

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
    
    let errorMessage = "Failed to upload logo";
    
    if (error instanceof Error) {
      errorMessage = `Upload failed: ${error.message}`;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 