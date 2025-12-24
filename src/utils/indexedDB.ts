// IndexedDB 工具函数
const DB_NAME = 'leetcode-108-visualizer';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      
      if (!db.objectStoreNames.contains('github')) {
        db.createObjectStore('github', { keyPath: 'key' });
      }
    };
  });
}

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction('settings', 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.value as T);
        } else {
          resolve(defaultValue);
        }
      };

      request.onerror = () => resolve(defaultValue);
    });
  } catch {
    return defaultValue;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('settings', 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to save setting:', error);
  }
}

export async function getGitHubStars(): Promise<{ stars: number; lastFetched: number } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction('github', 'readonly');
      const store = transaction.objectStore('github');
      const request = store.get('stars');

      request.onsuccess = () => {
        if (request.result) {
          resolve({
            stars: request.result.stars,
            lastFetched: request.result.lastFetched
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setGitHubStars(stars: number): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('github', 'readwrite');
      const store = transaction.objectStore('github');
      const request = store.put({
        key: 'stars',
        stars,
        lastFetched: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to save GitHub stars:', error);
  }
}
