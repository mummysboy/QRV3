import { NextResponse } from "next/server";
import { S3Client, HeadBucketCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-west-1",
});

const BUCKET_NAME = "qrewards-media6367c-dev";

export async function GET() {
  try {
    console.log("🧪 Testing S3 bucket accessibility...");
    
    // Test 1: Check if bucket exists and is accessible
    const headCommand = new HeadBucketCommand({
      Bucket: BUCKET_NAME,
    });
    
    let bucketExists = false;
    let bucketError: Error | null = null;
    
    try {
      await s3Client.send(headCommand);
      bucketExists = true;
      console.log("✅ Bucket exists and is accessible");
    } catch (error) {
      bucketError = error as Error;
      console.error("❌ Bucket access error:", error);
    }

    // Test 2: List objects in bucket (if accessible)
    let objects: Array<{Key?: string; Size?: number; LastModified?: Date}> = [];
    let listError: Error | null = null;
    
    if (bucketExists) {
      try {
        const listCommand = new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          MaxKeys: 10,
        });
        
        const result = await s3Client.send(listCommand);
        objects = result.Contents || [];
        console.log("✅ Successfully listed objects in bucket");
      } catch (error) {
        listError = error as Error;
        console.error("❌ List objects error:", error);
      }
    }

    // Test 3: Check for logo files specifically
    const logoFiles = objects.filter(obj => 
      obj.Key && obj.Key.startsWith('logos/')
    );

    return NextResponse.json({
      success: true,
      bucketName: BUCKET_NAME,
      region: "us-west-1",
      bucketExists,
      bucketError: bucketError ? bucketError.message : null,
      totalObjects: objects.length,
      logoFiles: logoFiles.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified
      })),
      listError: listError ? listError.message : null,
      testUrl: `https://${BUCKET_NAME}.s3.us-west-1.amazonaws.com/logos/test-logo.png`
    });
  } catch (error) {
    console.error("❌ S3 test error:", error);
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