import fs from 'fs';
import path from 'path';

// File path for storing admin credentials (for local development only)
const CREDENTIALS_FILE = path.join(process.cwd(), 'admin-credentials.json');

// Default admin credentials (fallback only)
const DEFAULT_EMAIL = 'isaac@rightimagedigital.com';
const DEFAULT_PASSWORD = 'admin123';

// Function to read credentials from file (local development)
function readCredentialsFromFile() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading credentials file:', error);
  }
  return null;
}

// Function to write credentials to file (local development)
function writeCredentials(email: string, password: string) {
  try {
    const data = JSON.stringify({ email, password }, null, 2);
    fs.writeFileSync(CREDENTIALS_FILE, data, 'utf8');
    console.log('Admin credentials updated successfully');
  } catch (error) {
    console.error('Error writing credentials file:', error);
  }
}

// Initialize with default credentials if file doesn't exist (local development only)
if (typeof window === 'undefined') { // Only run on server side
  try {
    if (!fs.existsSync(CREDENTIALS_FILE)) {
      writeCredentials(DEFAULT_EMAIL, DEFAULT_PASSWORD);
    }
  } catch (error) {
    // Silently fail in read-only environments (production)
    console.log('Cannot write credentials file (read-only environment)');
  }
}

export function getAdminCredentials() {
  // Priority 1: Environment variables (works in production)
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    return {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    };
  }
  
  // Priority 2: Read from file (local development)
  const fileCredentials = readCredentialsFromFile();
  if (fileCredentials) {
    return fileCredentials;
  }
  
  // Priority 3: Return default credentials as fallback
  return {
    email: DEFAULT_EMAIL,
    password: DEFAULT_PASSWORD
  };
}

export function updateAdminPassword(newPassword: string) {
  // Only works in local development with file system access
  const credentials = readCredentialsFromFile() || { email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD };
  writeCredentials(credentials.email, newPassword);
}

export function resetAdminPassword() {
  // Only works in local development with file system access
  writeCredentials(DEFAULT_EMAIL, DEFAULT_PASSWORD);
} 