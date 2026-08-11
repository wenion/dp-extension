import { dbPromise } from "./db/AppDatabase";

import type { Trace } from "@/shared/types";

const STORE_NAME = "traces";

export class TraceRepository {

  async initialize(): Promise<void> {
    // Ensure IndexedDB has finished opening.
    await dbPromise;
  }

  async clear(): Promise<void> {
    const db = await dbPromise;

    await db.clear(STORE_NAME);
  }

  async clearBySession(
    sessionId: string,
  ): Promise<void> {
    const db = await dbPromise;

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
    const db = await dbPromise;

    await db.add(STORE_NAME, trace);
  }

  async appendMany(
    traces: readonly Trace[],
  ): Promise<void> {
    if (traces.length === 0) {
      return;
    }

    const db = await dbPromise;

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
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
  }

  async getBySession(
    sessionId: string,
  ): Promise<Trace[]> {
    const db = await dbPromise;

    return db.getAllFromIndex(
      STORE_NAME,
      "sessionId",
      sessionId,
    );
  }

  async count(): Promise<number> {
    const db = await dbPromise;

    return db.count(STORE_NAME);
  }
}
