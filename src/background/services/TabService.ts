import { getDocumentId } from "./GoogleDocsService/GoogleDocsUtils";
import type { ContentScriptClient } from "../clients/ContentScriptClient";
import type { TabsRepository } from "../repositories/TabsRepository";

import type {
  RecordingScope,
  TabState,
} from "@/shared/types";

export class TabService {
  private readonly repository: TabsRepository;
  private readonly contentScriptClient: ContentScriptClient;

  constructor(
    repository: TabsRepository,
    contentScriptClient: ContentScriptClient,
  ) {
    this.repository = repository;
    this.contentScriptClient = contentScriptClient;
  }

  async registerTab(
    tabId: number,
    url: string,
    scope: RecordingScope,
    title?: string,
    connected?: boolean,
  ): Promise<TabState> {

    const now = Date.now();
    let origin = "";

    try {
      origin = new URL(url ?? "").origin;
    } catch {
      // Ignore invalid URL such as chrome:// or about:blank.
    }

    const tabState: TabState = {
      tabId: tabId,
      googleDocId: getDocumentId(url) ?? undefined,
      url: url,
      origin,
      title: title,
      recordingScope: scope,
      connected: connected ?? true,
      createdAt: now,
      updatedAt: now,
    }

    await this.setTab(tabState);

    return tabState;
  }

  async unregisterTab(tabId: number) {
    await this.removeTab(tabId);
  }

  async setTitle(
    tabId: number,
    title?: string,
  ): Promise<TabState | undefined> {
    return this.updateTab(
      tabId,
      tab => ({
        ...tab,
        title: title ?? tab.title,
        updatedAt: Date.now(),
      }),
    );
  }

  async resetExcludedTabs() {
    this.updateTabs(
      tab => tab.recordingScope === "excluded",
      tab => ({
        ...tab,
        recordingScope: "recording",
        updatedAt: Date.now(),
      }),
    );
  }

  async setRecording(
    tabId: number
  ): Promise<TabState | undefined> {
    return this.updateTab(
      tabId,
      tab => ({
        ...tab,
        recordingScope: "recording",
        updatedAt: Date.now(),
      }),
    );
  }

  async setOutOfScope(
    tabId: number
  ): Promise<TabState | undefined> {
    return this.updateTab(
      tabId,
      tab => ({
        ...tab,
        recordingScope: "not_in_scope",
        updatedAt: Date.now(),
      }),
    );
  }

  async setExcluded(
    tabId: number
  ): Promise<TabState | undefined> {
    return this.updateTab(
      tabId,
      tab => ({
        ...tab,
        recordingScope: "excluded",
        updatedAt: Date.now(),
      }),
    );
  }

  async setDisconnected(
    tabId: number
  ): Promise<TabState | undefined> {
    return this.updateTab(
      tabId,
      tab => ({
        ...tab,
        connected: false,
        updatedAt: Date.now(),
      }),
    );
  }

  async updateRecordingScopeByOrigins(
    origins:readonly string[],
    recordingScope: RecordingScope,
  ): Promise<void> {
    const originSet = new Set(origins);

    await this.updateTabs(
      tab => originSet.has(`${tab.origin}/*`),
      tab => ({
        ...tab,
        recordingScope,
        updatedAt: Date.now(),
      }),
    );
  }

  getTabIds(): number[] {
    return this.repository
      .getTabs()
      .map(tab => tab.tabId);
  }

  getTab(tabId: number) {
    return this.repository.getTab(tabId);
  }

  getTabs() {
    return this.repository.getTabs();
  }

  hasTab(tabId: number) {
    return this.repository.getTab(tabId) !== undefined;
  }

  isRecordable(tabId: number) {
    return (
      this.repository.getTab(tabId)?.recordingScope ===
      "recording"
    );
  }

  private async updateTab(
    tabId: number,
    updater: (tab: TabState) => TabState,
  ) {
    const updated = this.repository.updateTab(
      tabId,
      updater,
    );

    if (!updated) {
      return;
    }

    await this.notifyTabsUpdated();

    return updated;
  }

  private async updateTabs(
    predicate: (tab: TabState) => boolean,
    updater: (tab: TabState) => TabState,
  ) {
    this.repository.updateTabs(
      predicate,
      updater,
    );

    await this.notifyTabsUpdated();
  }

  private async setTab(tab: TabState) {
    this.repository.setTab(tab);

    await this.notifyTabsUpdated();
  }

  private async removeTab(tab: number) {
    this.repository.removeTab(tab);

    await this.notifyTabsUpdated();
  }

  private async notifyTabsUpdated() {
    await this.contentScriptClient.broadcast({
      type: "TABS/UPDATED",
      payload: this.getTabs(),
    });
  }
}
