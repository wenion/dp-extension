import { openDB } from "idb";
import type {
  DBSchema,
  IDBPDatabase,
} from "idb";

import type { Trace } from "@/shared/types";

const DATABASE_NAME = "TraceDB";
const STORE_NAME = "traces";
const VERSION = 2;

interface TraceDatabase extends DBSchema {
  traces: {
    key: number;
    value: Trace;
    indexes: {
      sessionId: string;
    };
  };
}

export class TraceRepository {
  private readonly dbPromise: Promise<IDBPDatabase<TraceDatabase>>;

  constructor() {
    this.dbPromise = openDB<TraceDatabase>(
      DATABASE_NAME,
      VERSION,
      {
        upgrade(db, oldVersion, _newVersion, transaction) {
          const store = db.objectStoreNames.contains(STORE_NAME)
            ? transaction.objectStore(STORE_NAME)
            : db.createObjectStore(STORE_NAME, {
                autoIncrement: true,
              });

          if (oldVersion < 2) {
            store.createIndex("sessionId", "sessionId");
          }
        },
      },
    );
  }

  async initialize(): Promise<void> {
    // Ensure IndexedDB has finished opening.
    await this.dbPromise;
  }

  async close(): Promise<void> {
    const db = await this.dbPromise;

    db.close();
  }

  async clear(): Promise<void> {
    const db = await this.dbPromise;

    await db.clear(STORE_NAME);
  }

  async clearBySession(
    sessionId: string,
  ): Promise<void> {
    const db = await this.dbPromise;

    const tx = db.transaction(
      STORE_NAME,
      "readwrite",
    );

    const index = tx.store.index("sessionId");

    let cursor = await index.openCursor(sessionId);

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }

    await tx.done;
  }

  async append(trace: Trace): Promise<void> {
    const db = await this.dbPromise;

    await db.add(STORE_NAME, trace);
  }

  async appendMany(
    traces: readonly Trace[],
  ): Promise<void> {
    if (traces.length === 0) {
      return;
    }

    const db = await this.dbPromise;

    const tx = db.transaction(
      STORE_NAME,
      "readwrite",
    );

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

  async getBySession(
    sessionId: string,
  ): Promise<Trace[]> {
    const db = await this.dbPromise;

    return db.getAllFromIndex(
      STORE_NAME,
      "sessionId",
      sessionId,
    );
  }

  async count(): Promise<number> {
    const db = await this.dbPromise;

    return db.count(STORE_NAME);
  }
}
