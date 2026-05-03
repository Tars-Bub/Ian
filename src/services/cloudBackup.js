// src/services/cloudBackup.js
import { openDB } from '../lib/indexedDB';

// Export all data to JSON file
export async function backupToFile() {
  const db = await openDB();
  
  const stores = ['users', 'orders', 'expenses', 'menu_items', 'supplies', 'shifts'];
  const backup = {};
  
  for (const storeName of stores) {
    backup[storeName] = await getAllItemsFromStore(db, storeName);
  }
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `maifah_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  alert('✅ Backup downloaded successfully!');
  return backup;
}

// Helper to get all items from a store
async function getAllItemsFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Restore data from JSON file
export async function restoreFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const db = await openDB();
        
        // Clear existing data and restore
        const stores = ['users', 'orders', 'expenses', 'menu_items', 'supplies', 'shifts'];
        
        for (const storeName of stores) {
          if (data[storeName]) {
            // Clear the store
            await clearStore(db, storeName);
            // Add all items back
            for (const item of data[storeName]) {
              await addItemToStore(db, storeName, item);
            }
          }
        }
        
        alert('✅ Data restored successfully! Please refresh the page.');
        resolve(data);
      } catch (err) {
        alert('❌ Restore failed: Invalid backup file');
        reject(err);
      }
    };
    reader.readAsText(file);
  });
}

async function clearStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function addItemToStore(db, storeName, item) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Auto-backup daily
export function startAutoBackup() {
  // Check last backup date
  const lastBackup = localStorage.getItem('last_backup_date');
  const today = new Date().toDateString();
  
  if (lastBackup !== today) {
    // Ask user if they want to backup
    if (confirm('Auto-backup reminder: Would you like to backup your data now?')) {
      backupToFile();
      localStorage.setItem('last_backup_date', today);
    }
  }
}

// Sync to cloud (Google Drive / Dropbox style)
// This creates a download link - user can save to their cloud
export function syncToCloud() {
  backupToFile();
  alert('Backup file created. You can now save it to Google Drive, Dropbox, or any cloud storage.');
}