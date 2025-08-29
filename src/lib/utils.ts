export function generateRewardCode(length = 16) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a Google Maps URL from an address string
 * @param address - The address text (e.g., "123 Main St, City, State 12345")
 * @returns A properly formatted Google Maps URL
 */
export function generateGoogleMapsUrl(address: string): string {
  if (!address) return '';
  
  // Encode the address for URL
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

// Cookie helpers
export function setCookie(name: string, value: string, days = 30, options: { path?: string; secure?: boolean; sameSite?: 'strict'|'lax'|'none' } = {}) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  let cookie = `${name}=${encodeURIComponent(value || '')}${expires}; path=${options.path || '/'}`;
  if (options.secure) cookie += '; Secure';
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  document.cookie = cookie;
}

export function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

export function deleteCookie(name: string, options: { path?: string } = {}) {
  document.cookie = `${name}=; Max-Age=0; path=${options.path || '/'}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

/**
 * Check if a card is expired based on its expiration date (timezone-safe version)
 * @param expires - The expiration date string (ISO format)
 * @returns true if the card is expired, false otherwise
 */
export function isCardExpiredTimezoneSafe(expires: string | null | undefined): boolean {
  if (!expires || expires.trim() === '') {
    return false; // No expiration date means it doesn't expire
  }
  
  try {
    // Parse the expiration date and convert to UTC
    const expirationDate = new Date(expires);
    const expirationUTC = Date.UTC(
      expirationDate.getUTCFullYear(),
      expirationDate.getUTCMonth(),
      expirationDate.getUTCDate(),
      expirationDate.getUTCHours(),
      expirationDate.getUTCMinutes(),
      expirationDate.getUTCSeconds(),
      expirationDate.getUTCMilliseconds()
    );
    
    // Get current time in UTC
    const now = new Date();
    const currentUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    );
    
    // Debug logging for timezone troubleshooting
    console.log('🔍 Timezone-Safe Debug:', {
      originalExpiration: expires,
      expirationUTC: new Date(expirationUTC).toISOString(),
      currentUTC: new Date(currentUTC).toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isExpired: expirationUTC < currentUTC,
      timeRemaining: expirationUTC - currentUTC
    });
    
    return expirationUTC < currentUTC;
  } catch (error) {
    console.error('Error parsing expiration date (timezone-safe):', error);
    return false; // If we can't parse the date, assume it's not expired
  }
}

/**
 * Check if a card is expired based on its expiration date
 * @param expires - The expiration date string (ISO format)
 * @returns true if the card is expired, false otherwise
 */
export function isCardExpired(expires: string | null | undefined): boolean {
  if (!expires || expires.trim() === '') {
    return false; // No expiration date means it doesn't expire
  }
  
  try {
    // Parse the expiration date (which is stored as UTC ISO string)
    const expirationDate = new Date(expires);
    
    // Get current time - ensure we're comparing in the same timezone context
    // For hosted environments, we need to be extra careful about timezone handling
    const currentTime = Date.now();
    
    // Debug logging for timezone troubleshooting
    console.log('🔍 Timezone Debug:', {
      expirationDate: expires,
      parsedExpiration: expirationDate.toISOString(),
      expirationTimestamp: expirationDate.getTime(),
      currentTime: currentTime,
      currentTimeISO: new Date(currentTime).toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      serverTime: new Date().toString()
    });
    
    // Compare the expiration date timestamp with current UTC timestamp
    // This avoids timezone conversion issues since both are in UTC
    const isExpired = expirationDate.getTime() < currentTime;
    
    console.log('🔍 Expiration Check:', {
      expirationDate: expirationDate.toISOString(),
      currentTime: new Date(currentTime).toISOString(),
      isExpired: isExpired,
      timeRemaining: expirationDate.getTime() - currentTime
    });
    
    return isExpired;
  } catch (error) {
    console.error('Error parsing expiration date:', error);
    return false; // If we can't parse the date, assume it's not expired
  }
}

/**
 * Check if a card is expired using forced UTC comparison (for hosted environments)
 * This function specifically handles AWS Lambda and other hosted environment timezone issues
 * @param expires - The expiration date string (ISO format)
 * @returns true if the card is expired, false otherwise
 */
export function isCardExpiredForcedUTC(expires: string | null | undefined): boolean {
  if (!expires || expires.trim() === '') {
    return false; // No expiration date means it doesn't expire
  }
  
  try {
    // Force UTC parsing to avoid timezone issues
    let expirationDate: Date;
    
    // Handle different date formats
    if (expires.includes('T') && !expires.includes('Z')) {
      // If it's ISO format without Z, treat it as local time and convert to UTC
      expirationDate = new Date(expires + 'Z');
    } else if (expires.includes('T') && expires.includes('Z')) {
      // If it's already UTC ISO format
      expirationDate = new Date(expires);
    } else {
      // If it's a simple date string, parse and convert to UTC
      expirationDate = new Date(expires);
    }
    
    // Force UTC conversion
    const expirationUTC = Date.UTC(
      expirationDate.getUTCFullYear(),
      expirationDate.getUTCMonth(),
      expirationDate.getUTCDate(),
      expirationDate.getUTCHours(),
      expirationDate.getUTCMinutes(),
      expirationDate.getUTCSeconds(),
      expirationDate.getUTCMilliseconds()
    );
    
    // Get current time in UTC
    const now = new Date();
    const currentUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    );
    
    const isExpired = expirationUTC < currentUTC;
    
    console.log('🔍 Forced UTC Expiration Check:', {
      originalExpiration: expires,
      parsedExpiration: expirationDate.toISOString(),
      expirationUTC: new Date(expirationUTC).toISOString(),
      currentUTC: new Date(currentUTC).toISOString(),
      isExpired: isExpired,
      timeRemaining: expirationUTC - currentUTC,
      timeRemainingHours: (expirationUTC - currentUTC) / (1000 * 60 * 60),
      environment: process.env.NODE_ENV || 'unknown'
    });
    
    return isExpired;
  } catch (error) {
    console.error('Error parsing expiration date (forced UTC):', error);
    return false; // If we can't parse the date, assume it's not expired
  }
}

/**
 * Filter out expired cards from an array
 * @param cards - Array of cards with expiration dates
 * @returns Array of non-expired cards
 */
export function filterExpiredCards<T extends { expires?: string | null }>(cards: T[]): T[] {
  return cards.filter(card => !isCardExpired(card.expires));
}

/**
 * Filter out expired cards and cards with 0 quantity from an array
 * @param cards - Array of cards with expiration dates and quantity
 * @returns Array of available cards (non-expired and quantity > 0)
 */
export function filterAvailableCards<T extends { expires?: string | null; quantity?: number }>(cards: T[]): T[] {
  // Use the simple method that works well locally
  // The issue might be elsewhere, not in the basic expiration checking
  return cards.filter(card => !isCardExpired(card.expires) && (card.quantity === undefined || card.quantity > 0));
}
