import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";

import type { Trace } from "@/shared/types";

const DATABASE_NAME = "TraceDB";
const STORE_NAME = "traces" as const;
const VERSION = 1;

export interface TraceStore {

  clear(): Promise<void>;

  append(trace: Trace): Promise<void>;

  appendMany(traces: readonly Trace[]): Promise<void>;

  getAll(): Promise<Trace[]>;
}

interface TraceDatabase extends DBSchema {
  traces: {
    key: number;
    value: Trace;
  };
}

export class IndexedDBTraceStore
  implements TraceStore
{
  private dbPromise: Promise<IDBPDatabase<TraceDatabase>>;

  constructor() {
    this.dbPromise = openDB<TraceDatabase>(DATABASE_NAME, VERSION, {
      upgrade(db) {

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { autoIncrement: true, });
        }

      },
    });
  }

  async close(): Promise<void> {
    const db = await this.dbPromise;

    db.close();
  }

  async clear(): Promise<void> {
    const db = await this.dbPromise;

    await db.clear(STORE_NAME);
  }

  async append(trace: Trace): Promise<void> {
    const db = await this.dbPromise;

    await db.add(STORE_NAME, trace);
  }

  async appendMany(traces: readonly Trace[]): Promise<void> {
    if (traces.length === 0) return;

    const db = await this.dbPromise;

    const tx = db.transaction(STORE_NAME, "readwrite");

    const store = tx.objectStore(STORE_NAME);

    for (const trace of traces) {
      store.add(trace);
    }

    await tx.done;
  }

  async getAll(): Promise<Trace[]> {
    const db = await this.dbPromise;

    return db.getAll(STORE_NAME);
  }
}
