import { transferToUserEventTrace } from "./GoogleDocsTraceMapper";

import type { GoogleDocsApiClient} from "./GoogleDocsApiClient";
import type { GoogleDocumentStore } from "./GoogleDocumentStore";
import type { GoogleDocumentEngine } from "./GoogleDocumentEngine";
import type { ContentScriptClient } from "../../clients/ContentScriptClient";

import type {
  GoogleDocsMeta,
  UserEvent,
} from "@/shared/types";

export class GoogleDocsService {
  private readonly api: GoogleDocsApiClient;
  private readonly store: GoogleDocumentStore;
  private readonly engine: GoogleDocumentEngine;
  private readonly contentScriptClient: ContentScriptClient;

  constructor(
    api: GoogleDocsApiClient,
    store: GoogleDocumentStore,
    engine: GoogleDocumentEngine,
    contentScriptClient: ContentScriptClient,
  ) {
    this.api = api;
    this.store = store;
    this.engine = engine;
    this.contentScriptClient = contentScriptClient;
  }

  async init(
    tabId: number,
    docId: string,
  ): Promise<void> {
    await this.showNotice(
      tabId,
      "Google Docs is preparing for recording...",
    );

    const content =
      await this.api.fetchDocumentText(docId);

    const state =
      this.engine.createInitialState(
        docId,
        content,
      );

    this.store.set(
      tabId,
      state,
    );

    await this.showNotice(
      tabId,
    );
  }

  async update(
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

  remove(tabId: number): boolean {
    return this.store.remove(tabId);
  }

  private async showNotice(
    tabId: number,
    message?: string,
  ): Promise<void> {
    try {
      await this.contentScriptClient.send(
        tabId,
        {
          type: "NOTICE/SHOW",
          payload: message,
        }
      );
    } catch (error) {
      console.error(error);
    }
  }
}
