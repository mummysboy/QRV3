import { getUrl } from 'aws-amplify/storage';

export async function getStorageUrl(key: string): Promise<string> {
  try {
    const result = await getUrl({ key });
    return result.url.toString();
  } catch (error) {
    console.error('Error getting storage URL:', error);
    // Fallback to constructing URL manually
    return `https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com/${key}`;
  }
}

// Use the actual S3 bucket from Amplify outputs instead of hardcoded CloudFront
// The CloudFront distribution d2rfrexwuran49.cloudfront.net is not accessible
const s3Bucket = "amplify-qrewardsnew-isaac-qrewardsstoragebucketb6d-lgupebttujw3";
const s3Region = "us-west-1";

export function getStorageUrlSync(key: string) {
  // Use direct S3 URL instead of CloudFront for now
  return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${key}`;
}

export async function getSignedLogoUrl(key: string): Promise<string> {
  try {
    // Try to get a signed URL from our API
    const response = await fetch(`/api/get-logo-url?key=${encodeURIComponent(key)}`);
    if (response.ok) {
      const data = await response.json();
      return data.url;
    }
  } catch (error) {
    console.error('Error getting signed logo URL:', error);
  }
  
  // Fallback to the storage URL
  return getStorageUrlSync(key);
} 