// services/dbService.ts

const DB_NAME = 'TemplateImageCacheDB';
const STORE_NAME = 'templateImages';
const DB_VERSION = 1;

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject('IndexedDB error');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveImage = (id: string, imageDataUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject('DB not initialized');
    }
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Using put to either add or update the record
    const request = store.put({ id, imageDataUrl });

    request.onsuccess = () => resolve();
    request.onerror = () => {
        console.error('Error saving image to IndexedDB:', request.error);
        reject(request.error);
    };
  });
};


export const getImage = (id: string): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject('DB not initialized');
        }
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result?.imageDataUrl);
        };

        request.onerror = () => {
            console.error('Error getting image from IndexedDB:', request.error);
            // Don't reject, just resolve undefined as it's a cache miss
            resolve(undefined);
        };
    });
};

export const clearDB = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject('DB not initialized');
        }
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error clearing IndexedDB:', request.error);
            reject(request.error);
        };
    });
}
