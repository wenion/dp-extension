import type { DocState } from "./types";

/**
 * Stores the current Google Docs state for each browser tab.
 *
 * Each tab maintains its own document state, which is updated
 * as Google Docs editing events are processed.
 */
export class GoogleDocumentStore {
  private readonly docs =
    new Map<number, DocState>();

  /**
   * Returns the document state associated with a tab.
   */
  get(tabId: number): DocState | undefined {
    return this.docs.get(tabId);
  }

  /**
   * Stores or replaces the document state for a tab.
   */
  set(
    tabId: number,
    state: DocState,
  ): void {
    this.docs.set(tabId, state);
  }

  /**
   * Returns whether a document state exists for a tab.
   */
  has(tabId: number): boolean {
    return this.docs.has(tabId);
  }

  /**
   * Removes the document state associated with a tab.
   */
  remove(tabId: number): boolean {
    return this.docs.delete(tabId);
  }

  /**
   * Removes all stored document states.
   */
  clear(): void {
    this.docs.clear();
  }
}
