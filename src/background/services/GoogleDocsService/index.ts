import { getDocumentId } from "./GoogleDocsUtils";
import { transferToUserEventTrace } from "./GoogleDocsTraceMapper";

import type { GoogleDocsApiClient} from "./GoogleDocsApiClient";
import type { GoogleDocumentStore } from "./GoogleDocumentStore";
import type { GoogleDocumentEngine } from "./GoogleDocumentEngine";

import type { UserEvent, GoogleDocsMeta } from "@/shared/types";


export class GoogleDocsService {
  private readonly api: GoogleDocsApiClient;
  private readonly store: GoogleDocumentStore;
  private readonly engine: GoogleDocumentEngine;

  constructor(
    api: GoogleDocsApiClient,
    store: GoogleDocumentStore,
    engine: GoogleDocumentEngine,
  ) {
    this.api = api;
    this.store = store;
    this.engine = engine;
  }

  async initializeDocument(
    tabId: number,
    url: string,
  ) {
    const docId = getDocumentId(url);

    if (!docId) {
      console.warn("Could not extract Google Docs document id:", url);
      return;
    }

    const text =
      await this.api.fetchDocumentText(docId);

    console.log("init text", text)

    this.store.initialize(
      tabId,
      url,
      docId,
      text,
    );

  }

  async updateDocument(
    tabId: number,
    meta: GoogleDocsMeta,
  ): Promise<UserEvent[]> {

    const current = this.store.get(tabId);

    if (!current) {
      throw new Error(
        `Google document for tab ${tabId} is not initialized.`,
      );
    }

    const updated = this.engine.apply(
      current,
      meta,
    );

    console.log("updated", updated)

    if (!updated) {
      return [];
    }

    this.store.set(
      tabId,
      updated,
    );

    return transferToUserEventTrace(
      "keystroke",
      updated,
    );
  }

  // TODO
  removeDocument(tabId: number): void {
    this.store.remove(tabId);
  }

  async ensureInitialized(
    tabId: number,
    url: string,
  ): Promise<void> {
    const docId = getDocumentId(url);

    if (!docId) {
      return;
    }

    const current = this.store.get(tabId);

    if (
      current &&
      current.docId === docId
    ) {
      return;
    }

    await this.initializeDocument(
      tabId,
      url,
    );
  }
}
