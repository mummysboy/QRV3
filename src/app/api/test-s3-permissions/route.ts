import { NextResponse } from "next/server";
import { S3Client, HeadBucketCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-west-1",
  // Only use credentials if running locally (not in Amplify)
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
    console.log("🧪 Testing S3 permissions in Amplify environment...");
    console.log("🔧 Environment check - ACCESS_KEY_ID exists:", !!process.env.ACCESS_KEY_ID);
    console.log("🔧 Environment check - SECRET_ACCESS_KEY exists:", !!process.env.SECRET_ACCESS_KEY);
    console.log("🔧 Using IAM role:", !process.env.ACCESS_KEY_ID && !process.env.SECRET_ACCESS_KEY);
    
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

    // Test 2: List objects in bucket (if accessible)
    let objects: Array<{Key?: string; Size?: number; LastModified?: Date}> = [];
    let listError = null;
    
    if (bucketAccessible) {
      try {
        const listCommand = new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          MaxKeys: 5,
        });
        
        const result = await s3Client.send(listCommand);
        objects = result.Contents || [];
        console.log("✅ Successfully listed objects in bucket");
      } catch (error) {
        listError = error;
        console.error("❌ List objects error:", error);
      }
    }

    // Test 3: Check for logo files specifically
    const logoFiles = objects.filter(obj => 
      obj.Key && obj.Key.startsWith('logos/')
    );

    return NextResponse.json({
      success: true,
      tests: {
        bucketAccessible,
        bucketError: bucketError ? (bucketError as Error).message : null,
        listObjectsSuccess: !listError,
        listError: listError ? (listError as Error).message : null,
        totalObjects: objects.length,
        logoFiles: logoFiles.length,
        sampleObjects: objects.slice(0, 3).map(obj => ({
          key: obj.Key,
          size: obj.Size,
          lastModified: obj.LastModified
        }))
      },
      environment: {
        usingIAMRole: !process.env.ACCESS_KEY_ID && !process.env.SECRET_ACCESS_KEY,
        region: "us-west-1",
        bucketName: BUCKET_NAME
      }
    });
  } catch (error) {
    console.error("❌ S3 permissions test error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 