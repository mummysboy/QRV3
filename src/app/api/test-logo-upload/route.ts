import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-west-1",
  // Add credentials if they exist in environment variables (for local development)
  // When deployed on AWS, this will use the IAM role automatically
  ...(process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY && {
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  }),
});

const BUCKET_NAME = "qrewards-media6367c-dev";

export async function GET() {
  try {
    console.log("🧪 Testing logo upload functionality...");
    console.log("🔧 ACCESS_KEY_ID exists:", !!process.env.ACCESS_KEY_ID);
    console.log("🔧 SECRET_ACCESS_KEY exists:", !!process.env.SECRET_ACCESS_KEY);
    console.log("🔧 REGION:", process.env.REGION || "us-west-1");
    
    // Test 1: Check bucket access
    const headCommand = new HeadBucketCommand({
      Bucket: BUCKET_NAME,
    });
    
    let bucketAccessible = false;
    let bucketError = null;
    
    try {
      await s3Client.send(headCommand);
      bucketAccessible = true;
      console.log("✅ Bucket is accessible");
    } catch (error) {
      bucketError = error;
      console.error("❌ Bucket access error:", error);
    }

    // Test 2: Try to upload a small test image file
    let uploadSuccess = false;
    let uploadError = null;
    let testLogoUrl = null;
    
    if (bucketAccessible) {
      try {
        const testFileName = `test-logos/test-logo-${Date.now()}.png`;
        
        // Create a simple 1x1 pixel PNG image buffer
        const pngBuffer = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
          0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
          0x49, 0x48, 0x44, 0x52, // IHDR
          0x00, 0x00, 0x00, 0x01, // width: 1
          0x00, 0x00, 0x00, 0x01, // height: 1
          0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
          0x90, 0x77, 0x53, 0xDE, // CRC
          0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
          0x49, 0x44, 0x41, 0x54, // IDAT
          0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
          0xE2, 0x21, 0xBC, 0x33, // CRC
          0x00, 0x00, 0x00, 0x00, // IEND chunk length
          0x49, 0x45, 0x4E, 0x44, // IEND
          0xAE, 0x42, 0x60, 0x82  // CRC
        ]);
        
        const uploadCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: testFileName,
          Body: pngBuffer,
          ContentType: 'image/png',
        });
        
        await s3Client.send(uploadCommand);
        uploadSuccess = true;
        testLogoUrl = `https://${BUCKET_NAME}.s3.us-west-1.amazonaws.com/${testFileName}`;
        console.log("✅ Test logo upload successful");
        console.log("✅ Test logo URL:", testLogoUrl);
        
      } catch (error) {
        uploadError = error;
        console.error("❌ Test logo upload error:", error);
      }
    }

    return NextResponse.json({
      success: true,
      bucketName: BUCKET_NAME,
      region: "us-west-1",
      hasCredentials: !!(process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY),
      bucketAccessible,
      bucketError: bucketError ? (bucketError as Error).message : null,
      uploadSuccess,
      uploadError: uploadError ? (uploadError as Error).message : null,
      testLogoUrl,
      environment: {
        hasAccessKey: !!process.env.ACCESS_KEY_ID,
        hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
        region: process.env.REGION || "us-west-1",
        usingIAM: !process.env.ACCESS_KEY_ID && !process.env.SECRET_ACCESS_KEY
      }
    });
  } catch (error) {
    console.error("❌ Logo upload test error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        bucketName: BUCKET_NAME
      },
      { status: 500 }
    );
  }
} 