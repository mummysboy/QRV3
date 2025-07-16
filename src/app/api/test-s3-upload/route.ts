import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

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

export async function GET() {
  try {
    console.log("🧪 Testing S3 upload functionality...");
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

    // Test 2: Try to upload a small test file
    let uploadSuccess = false;
    let uploadError = null;
    
    if (bucketAccessible) {
      try {
        const testFileName = `test-upload-${Date.now()}.txt`;
        const testContent = "This is a test upload from QRewards";
        
        const uploadCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: testFileName,
          Body: testContent,
          ContentType: 'text/plain',
          // Remove ACL since the bucket doesn't allow it
        });
        
        await s3Client.send(uploadCommand);
        uploadSuccess = true;
        console.log("✅ Test upload successful");
        
        // Clean up: Delete the test file
        // Note: We'll leave it for now to verify it was uploaded
      } catch (error) {
        uploadError = error;
        console.error("❌ Test upload error:", error);
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
      testUrl: uploadSuccess ? `https://${BUCKET_NAME}.s3.us-west-1.amazonaws.com/test-upload-${Date.now()}.txt` : null
    });
  } catch (error) {
    console.error("❌ S3 upload test error:", error);
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