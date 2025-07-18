import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-west-1",
});

const BUCKET_NAME = "amplify-qrewardsnew-isaac-qrewardsstoragebucketb6d-ioazr82zsrke";

export async function GET() {
  try {
    console.log("🧪 Testing S3 logo upload functionality...");
    console.log("🔧 Bucket name:", BUCKET_NAME);
    console.log("🔧 Region: us-west-1");
    
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
    let testUrl = null;
    
    if (bucketAccessible) {
      try {
        const testFileName = `test-logo-upload-${Date.now()}.txt`;
        const testContent = "This is a test logo upload from QRewards";
        
        const uploadCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: testFileName,
          Body: testContent,
          ContentType: 'text/plain',
          // Remove ACL since the bucket doesn't allow it
        });
        
        await s3Client.send(uploadCommand);
        uploadSuccess = true;
        testUrl = `https://${BUCKET_NAME}.s3.us-west-1.amazonaws.com/${testFileName}`;
        console.log("✅ Test upload successful");
        console.log("🔗 Test URL:", testUrl);
        
        // Test if the uploaded file is publicly accessible
        try {
          const response = await fetch(testUrl, { method: 'HEAD' });
          console.log("🔍 File accessibility test:", response.ok ? "✅ Publicly accessible" : "❌ Not publicly accessible");
        } catch {
          console.log("🔍 File accessibility test: ❌ Error checking accessibility");
        }
      } catch (error) {
        uploadError = error;
        console.error("❌ Test upload error:", error);
      }
    }

    return NextResponse.json({
      success: true,
      bucketName: BUCKET_NAME,
      region: "us-west-1",
      bucketAccessible,
      bucketError: bucketError ? (bucketError as Error).message : null,
      uploadSuccess,
      uploadError: uploadError ? (uploadError as Error).message : null,
      testUrl,
      logoUploadUrl: `https://${BUCKET_NAME}.s3.us-west-1.amazonaws.com/logos/`
    });
  } catch (error) {
    console.error("❌ S3 logo upload test error:", error);
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