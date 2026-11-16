// Mini wrapper IndexedDB : un store clé/valeur pour l'état, un store pour les fichiers (PDF, images…)
const DB_NAME = 'claudenote';
const VERSION = 1;
let dbPromise = null;

function openDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains('files')) db.createObjectStore('files');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

async function run(store, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function makeStore(name) {
  return {
    get: (k) => run(name, 'readonly', (s) => s.get(k)),
    set: (k, v) => run(name, 'readwrite', (s) => s.put(v, k)),
    del: (k) => run(name, 'readwrite', (s) => s.delete(k)),
    keys: () => run(name, 'readonly', (s) => s.getAllKeys()),
    clear: () => run(name, 'readwrite', (s) => s.clear()),
  };
}

export const kv = makeStore('kv');
export const files = makeStore('files');
