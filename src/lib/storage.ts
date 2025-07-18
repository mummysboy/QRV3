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

export function getStorageUrlSync(key: string): string {
  // For cases where we need a synchronous URL (like in img src)
  // This is a fallback when the async version can't be used
  return `https://qrewards-media6367c-dev.s3.us-west-1.amazonaws.com/${key}`;
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