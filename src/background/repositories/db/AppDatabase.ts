import { openDB } from "idb";
import type {
  DBSchema,
  IDBPDatabase,
} from "idb";

import type {
  Trace,
  Session,
} from "@/shared/types";

const DATABASE_NAME = "TraceDB";
const VERSION = 3;

export interface AppDatabase extends DBSchema {
  traces: {
    key: number;
    value: Trace;
    indexes: {
      sessionId: string;
    };
  };

  sessions: {
    key: string;
    value: Session;
  };
}

export type AppDB = IDBPDatabase<AppDatabase>;

export const dbPromise = openDB<AppDatabase>(
  DATABASE_NAME,
  VERSION,
  {
    upgrade(db, oldVersion, _newVersion, transaction) {
      // v1: traces store
      const traceStore = db.objectStoreNames.contains("traces")
        ? transaction.objectStore("traces")
        : db.createObjectStore("traces", {
            autoIncrement: true,
          });

      // v2: sessionId index
      if (oldVersion < 2) {
        traceStore.createIndex(
          "sessionId",
          "sessionId",
        );
      }

      // v3: sessions store
      if (oldVersion < 3) {
        db.createObjectStore("sessions", {
          keyPath: "clientId",
        });
      }
    },
  },
);