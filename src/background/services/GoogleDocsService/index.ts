import { transferToUserEventTrace } from "./GoogleDocsTraceMapper";

import type { GoogleDocsApiClient} from "./GoogleDocsApiClient";
import type { GoogleDocumentStore } from "./GoogleDocumentStore";
import type { GoogleDocumentEngine } from "./GoogleDocumentEngine";
import type { ContentScriptClient } from "../../clients/ContentScriptClient";

import type { UserEvent, GoogleDocsMeta } from "@/shared/types";

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

  async create(
    tabId: number,
    url: string,
    docId: string,
  ): Promise<string> {
    const current = this.store.get(tabId);

    if (current?.docId === docId) {
      return current.state;
    }

    return this.loadDocument(
      tabId,
      url,
      docId,
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

  async reload(
    tabId: number,
    url: string,
    docId: string,
  ): Promise<string> {
    return this.loadDocument(
      tabId,
      url,
      docId,
    );
  }

  private async loadDocument(
    tabId: number,
    url: string,
    docId: string,
  ): Promise<string> {
    const text =
      await this.api.fetchDocumentText(docId);

    this.store.initialize(
      tabId,
      url,
      docId,
      text,
    );

    await this.contentScriptClient.broadcast({
      type: "PAGE/SHOW",
      payload: {
        tabId,
        message: "Google Doc ready for recording",
        autoDismissMs: 5,
      },
    });

    return text;
  }
}
