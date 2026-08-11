import { getDocumentId } from "../services/GoogleDocsService/GoogleDocsUtils";

import type { GoogleDocsMeta } from "@/shared/types";
import type { GoogleDocsService } from "../services/GoogleDocsService";
import type { TabsService } from "../services/TabsService";

export class GoogleDocsController {

  private googleDocsService: GoogleDocsService;
  private tabsService: TabsService;

  constructor(
    googleDocsService: GoogleDocsService,
    tabsService: TabsService,
  ) {
    this.googleDocsService = googleDocsService;
    this.tabsService = tabsService;
  }

  async initialize(
    tabId: number,
    url: string,
  ): Promise<string> {
    const docId = getDocumentId(url);
    
    if (!docId) {
      this.googleDocsService.remove(tabId);
      return "";
    }

    return this.googleDocsService.create(
      tabId,
      url,
      docId,
    );
  }

  remove(tabId: number) {
    this.googleDocsService.remove(tabId);
  }

  async updateDocument(
    tabId: number,
    meta: GoogleDocsMeta,
  ) {
    return await this.googleDocsService.update(tabId, meta);
  }

  async replaceAll(): Promise<void> {
    const tabs = this.tabsService.getTabs();

    await Promise.all(
      tabs
        .filter(tab => tab.googleDocId)
        .map(tab =>
          this.googleDocsService.reload(
            tab.tabId,
            tab.url,
            tab.googleDocId!,
          ),
        ),
    );
  }
}
