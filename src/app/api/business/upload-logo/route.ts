import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const s3Client = new S3Client({
  region: "us-west-1",
  // Add credentials if they exist in environment variables
  ...(process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY && {
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  }),
});

const BUCKET_NAME = "qrewards-media6367c-dev";

export async function POST(request: NextRequest) {
  try {
    // Debug: Log AWS configuration
    console.log("🔧 Logo upload - AWS Configuration:");
    console.log("🔧 ACCESS_KEY_ID exists:", !!process.env.ACCESS_KEY_ID);
    console.log("🔧 SECRET_ACCESS_KEY exists:", !!process.env.SECRET_ACCESS_KEY);
    console.log("🔧 REGION:", process.env.REGION || "us-west-1");
    
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

    // Accept any image type, but process/convert it below
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

    // Generate unique filename (always .png)
    const fileName = `logos/${businessName.replace(/[^a-zA-Z0-9]/g, '-')}-${uuidv4()}.png`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: processedBuffer,
      ContentType: 'image/png',
    });

    await s3Client.send(uploadCommand);

    // Construct the public URL
    const logoUrl = `https://${BUCKET_NAME}.s3.us-west-1.amazonaws.com/${fileName}`;

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
    
    // Provide more specific error messages
    let errorMessage = "Failed to upload logo";
    
    if (error instanceof Error) {
      if (error.message.includes("AccessDenied") || error.message.includes("403")) {
        errorMessage = "Access denied. Please check S3 bucket permissions.";
      } else if (error.message.includes("NoSuchBucket")) {
        errorMessage = "S3 bucket not found. Please check bucket configuration.";
      } else if (error.message.includes("InvalidAccessKeyId")) {
        errorMessage = "Invalid AWS credentials. Please check environment variables.";
      } else {
        errorMessage = `Upload failed: ${error.message}`;
      }
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