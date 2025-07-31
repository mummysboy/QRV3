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
 * Check if a card is expired based on its expiration date
 * @param expires - The expiration date string (ISO format)
 * @returns true if the card is expired, false otherwise
 */
export function isCardExpired(expires: string | null | undefined): boolean {
  if (!expires || expires.trim() === '') {
    return false; // No expiration date means it doesn't expire
  }
  
  try {
    const expirationDate = new Date(expires);
    // Use timestamp comparison to avoid timezone issues between local and AWS deployment
    const currentTimestamp = Date.now();
    const expirationTimestamp = expirationDate.getTime();
    
    // Check if the expiration timestamp is in the past
    return expirationTimestamp < currentTimestamp;
  } catch (error) {
    console.error('Error parsing expiration date:', error);
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
