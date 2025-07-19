import fs from 'fs';
import path from 'path';

// File path for storing admin credentials
const CREDENTIALS_FILE = path.join(process.cwd(), 'admin-credentials.json');

// Default admin credentials
const DEFAULT_EMAIL = 'isaac@rightimagedigital.com';
const DEFAULT_PASSWORD = 'admin123';

// Function to read credentials from file
function readCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading credentials file:', error);
  }
  
  // Return default credentials if file doesn't exist or is invalid
  return {
    email: DEFAULT_EMAIL,
    password: DEFAULT_PASSWORD
  };
}

// Function to write credentials to file
function writeCredentials(email: string, password: string) {
  try {
    const data = JSON.stringify({ email, password }, null, 2);
    fs.writeFileSync(CREDENTIALS_FILE, data, 'utf8');
    console.log('Admin credentials updated successfully');
  } catch (error) {
    console.error('Error writing credentials file:', error);
  }
}

// Initialize with default credentials if file doesn't exist
if (!fs.existsSync(CREDENTIALS_FILE)) {
  writeCredentials(DEFAULT_EMAIL, DEFAULT_PASSWORD);
}

export function getAdminCredentials() {
  return readCredentials();
}

export function updateAdminPassword(newPassword: string) {
  const credentials = readCredentials();
  writeCredentials(credentials.email, newPassword);
}

export function resetAdminPassword() {
  writeCredentials(DEFAULT_EMAIL, DEFAULT_PASSWORD);
} 