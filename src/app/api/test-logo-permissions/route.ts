import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-west-1",
});

const BUCKET_NAME = "qrewards-media6367c-dev";

export async function GET() {
  try {
    console.log("🧪 Testing S3 permissions for logo upload...");
    console.log("🔧 Using IAM role (no explicit credentials)");
    console.log("🔧 Region:", "us-west-1");
    console.log("🔧 Bucket:", BUCKET_NAME);
    
    const results: {
      bucketAccess: boolean;
      uploadPermission: boolean;
      bucketError: string | null;
      uploadError: string | null;
      testFileUrl: string | null;
    } = {
      bucketAccess: false,
      uploadPermission: false,
      bucketError: null,
      uploadError: null,
      testFileUrl: null
    };

    // Test 1: Check bucket access
    try {
      const headCommand = new HeadBucketCommand({
        Bucket: BUCKET_NAME,
      });
      await s3Client.send(headCommand);
      results.bucketAccess = true;
      console.log("✅ Bucket access successful");
    } catch (error) {
      results.bucketError = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Bucket access failed:", error);
    }

    // Test 2: Try to upload a test file
    if (results.bucketAccess) {
      try {
        const testFileName = `test-permissions-${Date.now()}.txt`;
        const testContent = "Test file for logo upload permissions";
        
        const uploadCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `logos/${testFileName}`,
          Body: testContent,
          ContentType: 'text/plain',
        });
        
        await s3Client.send(uploadCommand);
        results.uploadPermission = true;
        results.testFileUrl = `https://${BUCKET_NAME}.s3.us-west-1.amazonaws.com/logos/${testFileName}`;
        console.log("✅ Upload permission successful");
      } catch (error) {
        results.uploadError = error instanceof Error ? error.message : "Unknown error";
        console.error("❌ Upload permission failed:", error);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      bucketName: BUCKET_NAME,
      region: "us-west-1",
      usingIAMRole: true,
      ...results,
      recommendations: {
        bucketAccess: results.bucketAccess ? "✅ Good" : "❌ Check IAM role has s3:ListBucket permission",
        uploadPermission: results.uploadPermission ? "✅ Good" : "❌ Check IAM role has s3:PutObject permission",
        nextSteps: results.uploadPermission 
          ? "Logo upload should work now!" 
          : "Update IAM role with S3 permissions and redeploy"
      }
    });
  } catch (error) {
    console.error("❌ S3 permissions test error:", error);
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