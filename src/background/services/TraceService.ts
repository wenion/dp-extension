import type { TraceStore } from "../storage/TraceStorage";

import type {
  Trace,
  UserEvent,
  TraceContext,
} from "@/shared/types";


export class TraceService {
  private readonly buffer: Trace[] = [];
  private readonly flushSize: number;
  private readonly store: TraceStore;

  constructor(
    store: TraceStore,
    flushSize = 100,
  ) {
    this.store = store;
    this.flushSize = flushSize;
  }

  /**
   * Called when recording starts.
   */
  async startSession(): Promise<void> {
    this.buffer.length = 0;

    await this.store.clear();
  }

  /**
   * Add one trace.
   */
  async add(userEvent: UserEvent, context: TraceContext): Promise<void> {

    this.buffer.push({
      ...userEvent,
      ...context,
    });

    if (this.buffer.length >= this.flushSize) {
      await this.flush();
    }
  }

  /**
   * Flush memory buffer to IndexedDB.
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const traces = [...this.buffer];

    this.buffer.length = 0;

    await this.store.appendMany(traces);
  }

  /**
   * Called when recording ends.
   */
  async stopSession(): Promise<Trace[]> {
    await this.flush();

    return this.store.getAll();
  }

  /**
   * Upload succeeded.
   */
  async completeSession(): Promise<void> {
    this.buffer.length = 0;

    await this.store.clear();
  }

  /**
   * Number of traces waiting in memory.
   */
  get pendingCount(): number {
    return this.buffer.length;
  }
}