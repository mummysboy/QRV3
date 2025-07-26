import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

// Simple file-based storage for pending updates
const STORAGE_FILE = join(process.cwd(), 'pending-updates.json');

// Helper functions for storage
export const loadPendingUpdates = () => {
  try {
    if (existsSync(STORAGE_FILE)) {
      const data = readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log("⚠️ Could not load pending updates file:", error);
  }
  return [];
};

export const savePendingUpdates = (updates: unknown[]) => {
  try {
    writeFileSync(STORAGE_FILE, JSON.stringify(updates, null, 2));
    console.log(`✅ Saved ${updates.length} pending updates to file`);
  } catch (error) {
    console.log("⚠️ Could not save pending updates file:", error);
  }
}; 