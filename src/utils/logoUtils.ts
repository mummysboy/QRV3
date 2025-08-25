// src/utils/logoUtils.ts
// Utility functions for handling logo URLs consistently across the application

import outputs from "../amplify_outputs.json";

const BUCKET_NAME = (outputs as any).storage?.bucket_name || "amplify-qrewardsnew-isaac-qrewardsstoragebucketb6d-lgupebttujw3";
const REGION = (outputs as any).storage?.aws_region || "us-west-1";

/**
 * Normalizes a logo URL to ensure consistent format
 * @param logoUrl - The logo URL from the database
 * @returns Normalized logo URL
 */
export function normalizeLogoUrl(logoUrl: string | null | undefined): string {
  if (!logoUrl || logoUrl.trim() === '') {
    return '/demo-coffee-logo.svg'; // Default fallback logo
  }

  // If it's already a full S3 URL, return as is
  if (logoUrl.startsWith('http') && logoUrl.includes('s3.')) {
    return logoUrl;
  }

  // If it's a relative path starting with logos/, convert to full S3 URL
  if (logoUrl.startsWith('logos/')) {
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${logoUrl}`;
  }

  // If it's a relative path starting with /, it's a local asset
  if (logoUrl.startsWith('/')) {
    return logoUrl;
  }

  // If it's just a filename without path, assume it's in logos/ folder
  if (!logoUrl.includes('/')) {
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/logos/${logoUrl}`;
  }

  // Default case: return as is
  return logoUrl;
}

/**
 * Gets the S3 key from a logo URL
 * @param logoUrl - The logo URL
 * @returns S3 key or null if not an S3 URL
 */
export function getLogoKey(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) return null;

  // If it's an S3 URL, extract the key
  if (logoUrl.includes('s3.') && logoUrl.includes('.amazonaws.com/')) {
    const urlParts = logoUrl.split('.amazonaws.com/');
    if (urlParts.length > 1) {
      return urlParts[1];
    }
  }

  // If it's already a key (starts with logos/)
  if (logoUrl.startsWith('logos/')) {
    return logoUrl;
  }

  return null;
}

/**
 * Checks if a logo URL is a valid S3 URL
 * @param logoUrl - The logo URL to check
 * @returns True if it's a valid S3 URL
 */
export function isValidS3LogoUrl(logoUrl: string | null | undefined): boolean {
  if (!logoUrl) return false;
  return logoUrl.includes('s3.') && logoUrl.includes('.amazonaws.com/');
}

/**
 * Gets the default logo URL for fallback
 * @returns Default logo URL
 */
export function getDefaultLogoUrl(): string {
  return '/demo-coffee-logo.svg';
}

/**
 * Extracts business name from logo key for display purposes
 * @param logoKey - The S3 key of the logo
 * @returns Business name extracted from logo key
 */
export function extractBusinessNameFromLogoKey(logoKey: string | null): string {
  if (!logoKey) return 'Business';
  
  // Remove logos/ prefix and file extension
  const cleanKey = logoKey.replace(/^logos\//, '').replace(/\.[^/.]+$/, '');
  
  // Remove UUID suffix (last part after last dash)
  const parts = cleanKey.split('-');
  if (parts.length > 1) {
    // Remove the last part (UUID) and join the rest
    return parts.slice(0, -1).join('-');
  }
  
  return cleanKey;
}

