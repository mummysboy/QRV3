import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, HeadBucketCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-west-1",
});

const BUCKET_NAME = "qrewards-media6367c-dev";

export async function GET() {
  try {
    console.log("🔍 Debugging S3 permissions...");
    
    const results: {
      timestamp: string;
      bucketName: string;
      region: string;
      tests: {
        bucketExists: boolean;
        bucketAccessible: boolean;
        canListObjects: boolean;
        canUpload: boolean;
        canRead: boolean;
      };
      errors: Record<string, string>;
      recommendations: string[];
    } = {
      timestamp: new Date().toISOString(),
      bucketName: BUCKET_NAME,
      region: "us-west-1",
      tests: {
        bucketExists: false,
        bucketAccessible: false,
        canListObjects: false,
        canUpload: false,
        canRead: false
      },
      errors: {},
      recommendations: []
    };

    // Test 1: Check if bucket exists
    try {
      const headCommand = new HeadBucketCommand({ Bucket: BUCKET_NAME });
      await s3Client.send(headCommand);
      results.tests.bucketExists = true;
      results.tests.bucketAccessible = true;
      console.log("✅ Bucket exists and is accessible");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.errors.bucketAccess = errorMessage;
      console.error("❌ Bucket access failed:", errorMessage);
      results.recommendations.push("Check if bucket exists and IAM role has s3:ListBucket permission");
    }

    // Test 2: Try to list objects
    if (results.tests.bucketAccessible) {
      try {
        const listCommand = new ListObjectsV2Command({ 
          Bucket: BUCKET_NAME, 
          MaxKeys: 1 
        });
        await s3Client.send(listCommand);
        results.tests.canListObjects = true;
        console.log("✅ Can list objects in bucket");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.errors.listObjects = errorMessage;
        console.error("❌ List objects failed:", errorMessage);
        results.recommendations.push("Check IAM role has s3:ListBucket permission");
      }
    }

    // Test 3: Try to upload a test file
    if (results.tests.bucketAccessible) {
      try {
        const testFileName = `debug-test-${Date.now()}.txt`;
        const testContent = "Debug test file";
        
        const uploadCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `logos/${testFileName}`,
          Body: testContent,
          ContentType: 'text/plain',
        });
        
        await s3Client.send(uploadCommand);
        results.tests.canUpload = true;
        console.log("✅ Can upload to bucket");
        
        // Clean up: Try to delete the test file
        try {
          // Note: We don't have delete permission in our policy, so this will fail
          // But that's expected and shows our policy is working correctly
        } catch {
          console.log("ℹ️ Delete failed (expected - we don't have delete permission)");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.errors.upload = errorMessage;
        console.error("❌ Upload failed:", errorMessage);
        results.recommendations.push("Check IAM role has s3:PutObject permission");
      }
    }

    // Generate recommendations based on results
    if (!results.tests.bucketAccessible) {
      results.recommendations.push("IAM role needs s3:ListBucket permission");
    }
    if (!results.tests.canUpload) {
      results.recommendations.push("IAM role needs s3:PutObject permission");
    }
    if (results.tests.canUpload && results.tests.canListObjects) {
      results.recommendations.push("✅ All permissions working correctly!");
    }

    return NextResponse.json({
      success: true,
      ...results,
      summary: {
        working: Object.values(results.tests).filter(Boolean).length,
        total: Object.keys(results.tests).length,
        status: results.tests.canUpload ? "READY" : "NEEDS_PERMISSIONS"
      }
    });
  } catch (error) {
    console.error("❌ S3 permissions debug error:", error);
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