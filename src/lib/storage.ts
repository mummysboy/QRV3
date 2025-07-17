import { getUrl } from 'aws-amplify/storage';

export async function getStorageUrl(key: string): Promise<string> {
  try {
    const result = await getUrl({ key });
    return result.url.toString();
  } catch (error) {
    console.error('Error getting storage URL:', error);
    // Fallback to constructing URL manually
    return `https://amplify-qrewardsnew-isaac-qrewardsstoragebucketb6d-ioazr82zsrke.s3.us-west-1.amazonaws.com/${key}`;
  }
}

export function getStorageUrlSync(key: string): string {
  // For cases where we need a synchronous URL (like in img src)
  // This is a fallback when the async version can't be used
  return `https://amplify-qrewardsnew-isaac-qrewardsstoragebucketb6d-ioazr82zsrke.s3.us-west-1.amazonaws.com/${key}`;
} 