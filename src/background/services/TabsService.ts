import { getDocumentId } from "./GoogleDocsService/GoogleDocsUtils";
import type { ContentScriptClient } from "../clients/ContentScriptClient";
import type { TabsRepository } from "../repositories/TabsRepository";

import type {
  RecordingScope,
  TabState,
} from "@/shared/types";

export class TabsService {
  private readonly repository: TabsRepository;
  private readonly contentScriptClient: ContentScriptClient;

  constructor(
    repository: TabsRepository,
    contentScriptClient: ContentScriptClient,
  ) {
    this.repository = repository;
    this.contentScriptClient = contentScriptClient;
  }

  async addTab(
    tabId: number,
    url: string,
    origin: string,
    recordingScope: RecordingScope,
    connected: boolean,
    title?: string,
  ): Promise<TabState> {
    const now = Date.now();

    const tabState: TabState = {
      tabId: tabId,
      url,
      origin,
      title,
      googleDocId: getDocumentId(url),
      recordingScope,
      connected,
      createdAt: now,
      updatedAt: now,
    }

    return this.createTab(tabState);
  }
  
  async removeTab(
    tab: number
  ): Promise<boolean> {
    const result =
      this.repository.removeTab(tab);
    await this.notifyTabsUpdated();

    return result;
  }

  async updateTitle(
    tabId: number,
    title?: string,
  ): Promise<TabState | undefined> {
    return this.updateTab(
      tabId,
      {
        title,
        updatedAt: Date.now(),
      },
    );
  }

  async setRecording(
    tabId: number,
  ): Promise<TabState | undefined> {
    return this.updateTab(
      tabId,
      {
        recordingScope: "recording",
        updatedAt: Date.now(),
      },
    );
  }

  async setOutOfScope(
    tabId: number,
  ): Promise<TabState | undefined> {
    return this.updateTab(
      tabId,
      {
        recordingScope: "not_in_scope",
        updatedAt: Date.now(),
      },
    );
  }

  async setExcluded(
    tabId: number,
  ): Promise<TabState | undefined> {
    return this.updateTab(
      tabId,
      {
        recordingScope: "excluded",
        updatedAt: Date.now(),
      },
    );
  }

  async setConnected(
    tabId: number,
    connected: boolean,
  ): Promise<TabState | undefined> {
    return this.updateTab(
      tabId,
      {
        connected,
        updatedAt: Date.now(),
      },
    );
  }

  async setExcludedTabsToRecording(): Promise<TabState[]> {
    return this.updateTabs(
      tab => tab.recordingScope === "excluded",
      tab => ({
        ...tab,
        recordingScope: "recording",
        updatedAt: Date.now(),
      }),
    );
  }

  async setRecordingScopeByOrigins(
    origins:readonly string[],
    recordingScope: RecordingScope,
  ): Promise<TabState[]> {
    const originSet = new Set(origins);

    return this.updateTabs(
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

  getTab(tabId: number): TabState | undefined {
    return this.repository.getTab(tabId);
  }

  getTabs(): readonly TabState[] {
    return this.repository.getTabs();
  }

  getTabsByOrigin(origin: string): TabState[] {
    return this.repository
      .getTabs()
      .filter(tab => tab.origin === origin);
  }

  hasTab(tabId: number): boolean {
    return this.repository.getTab(tabId) !== undefined;
  }

  isRecordable(tabId: number): boolean {
    return (
      this.repository.getTab(tabId)?.recordingScope ===
      "recording"
    );
  }

  private async createTab(
    tab: TabState,
  ): Promise<TabState> {
    this.repository.setTab(tab);
    await this.notifyTabsUpdated();

    return tab;
  }

  private async updateTab(
    tabId: number,
    patch: Partial<TabState>,
  ): Promise<TabState | undefined> {
    const updated =
      this.repository.updateTab(
        tabId,
        tab => ({
          ...tab,
          ...patch,
        })
      );
    await this.notifyTabsUpdated();
    return updated;
  }

  private async updateTabs(
    predicate: (tab: TabState) => boolean,
    updater: (tab: TabState) => TabState,
  ): Promise<TabState[]> {
    const updatedTabs = this.repository.updateTabs(
      predicate,
      updater,
    );

    await this.notifyTabsUpdated();

    return updatedTabs;
  }

  private async notifyTabsUpdated() {
    await this.contentScriptClient.broadcast({
      type: "TABS/UPDATED",
      payload: this.getTabs(),
    });
  }
}
