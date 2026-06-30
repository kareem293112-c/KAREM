import { Product, Transaction } from '../types';

const DB_NAME = 'AccountingPwaDB';
const DB_VERSION = 1;

export interface OfflineSyncQueueItem {
  id: string;
  type: 'transaction_add' | 'transaction_delete' | 'product_update';
  payload: any;
  timestamp: string;
}

export class PwaDatabase {
  private db: IDBDatabase | null = null;

  private initPromise: Promise<IDBDatabase>;

  constructor() {
    this.initPromise = this.init();
  }

  private init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open local database'));
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(this.db!);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // Products Store
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }

        // Transactions Store
        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions', { keyPath: 'id' });
        }

        // Sync Queue Store (for offline background synchronization)
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    await this.initPromise;
    if (!this.db) {
      throw new Error('Database is not initialized');
    }
    return this.db;
  }

  // --- PRODUCTS STORE ---

  public async getProducts(): Promise<Product[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('products', 'readonly');
      const store = transaction.objectStore('products');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async saveProduct(product: Product): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('products', 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.put(product);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteProduct(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('products', 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async saveProductsBatch(products: Product[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('products', 'readwrite');
      const store = transaction.objectStore('products');

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      products.forEach((prod) => {
        store.put(prod);
      });
    });
  }

  // --- TRANSACTIONS STORE ---

  public async getTransactions(): Promise<Transaction[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('transactions', 'readonly');
      const store = transaction.objectStore('transactions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async saveTransaction(tx: Transaction): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('transactions', 'readwrite');
      const store = transaction.objectStore('transactions');
      const request = store.put(tx);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteTransaction(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('transactions', 'readwrite');
      const store = transaction.objectStore('transactions');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async saveTransactionsBatch(txs: Transaction[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('transactions', 'readwrite');
      const store = transaction.objectStore('transactions');

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      txs.forEach((tx) => {
        store.put(tx);
      });
    });
  }

  // --- OFFLINE SYNC QUEUE STORE ---

  public async getSyncQueue(): Promise<OfflineSyncQueueItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('sync_queue', 'readonly');
      const store = transaction.objectStore('sync_queue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async addToSyncQueue(item: Omit<OfflineSyncQueueItem, 'timestamp'>): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('sync_queue', 'readwrite');
      const store = transaction.objectStore('sync_queue');
      
      const fullItem: OfflineSyncQueueItem = {
        ...item,
        timestamp: new Date().toISOString()
      };

      const request = store.put(fullItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async removeFromSyncQueue(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('sync_queue', 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- GENERAL MANAGEMENT ---

  public async clearAll(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['products', 'transactions', 'sync_queue'], 'readwrite');
      const productsStore = transaction.objectStore('products');
      const transactionsStore = transaction.objectStore('transactions');
      const syncStore = transaction.objectStore('sync_queue');

      productsStore.clear();
      transactionsStore.clear();
      syncStore.clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const pwaDb = new PwaDatabase();
