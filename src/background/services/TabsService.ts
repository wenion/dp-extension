import { extractGoogleDocsId } from "@/shared/utils";

import type { ContentScriptClient } from "../clients/ContentScriptClient";
import type { AllowlistRepository } from "../repositories/AllowlistRepository";
import type { TabsRepository } from "../repositories/TabsRepository";

import type {
  RecordingScope,
  TabState,
} from "@/shared/types";

export class TabsService {
  private readonly allowlistRepository: AllowlistRepository;
  private readonly tabsRepository: TabsRepository;
  private readonly contentScriptClient: ContentScriptClient;

  constructor(
    allowlistRepository: AllowlistRepository,
    tabsRepository: TabsRepository,
    contentScriptClient: ContentScriptClient,
  ) {
    this.allowlistRepository = allowlistRepository;
    this.tabsRepository = tabsRepository;
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
      googleDocId: extractGoogleDocsId(url),
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
      await this.tabsRepository.removeTab(tab);
    await this.notifyTabsUpdated();

    return result;
  }

  async removeTabs(
    tabIds: readonly number[],
  ): Promise<void> {
    if (tabIds.length === 0) {
      return;
    }

    const tabIdSet = new Set(tabIds);

    const tabs = this.tabsRepository
      .getTabs()
      .filter(tab =>
        !tabIdSet.has(tab.tabId),
      );

    await this.tabsRepository.setTabs(tabs);

    await this.notifyTabsUpdated();
  }

  async addToAllowlist(
    origin: string,
  ): Promise<void> {
    await this.allowlistRepository.addOrigin(
      origin,
    );

    await this.setRecordingScopeByOrigins(
      [origin],
      "recording",
    );

    await this.notifyAllowlistUpdated();
  }

  async removeFromAllowlist(
    origin: string,
  ): Promise<TabState[]> {
    await this.allowlistRepository.removeOrigin(
      origin,
    );

    const updatedTabs =
      await this.setRecordingScopeByOrigins(
        [origin],
        "not_in_scope",
      );

    await this.notifyAllowlistUpdated();

    return updatedTabs;
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

  async resetRecordingScopesFromAllowlist(): Promise<TabState[]> {
    return this.updateTabs(
      () => true,
      tab => ({
        ...tab,
        recordingScope: this.isAllowlisted(tab.origin)
          ? "recording"
          : "not_in_scope",
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
      tab => originSet.has(tab.origin),
      tab => ({
        ...tab,
        recordingScope,
        updatedAt: Date.now(),
      }),
    );
  }

  getTabIds(): number[] {
    return this.tabsRepository
      .getTabs()
      .map(tab => tab.tabId);
  }

  getTab(tabId: number): TabState | undefined {
    return this.tabsRepository.getTab(tabId);
  }

  getTabs(): readonly TabState[] {
    return this.tabsRepository.getTabs();
  }

  getTabsByOrigin(origin: string): TabState[] {
    return this.tabsRepository
      .getTabs()
      .filter(tab => tab.origin === origin);
  }

  hasTab(tabId: number): boolean {
    return this.tabsRepository.getTab(tabId) !== undefined;
  }

  getAllowlist(): readonly string[] {
    return this.allowlistRepository.getOrigins();
  }

  isAllowlisted(
    origin: string,
  ): boolean {
    return this.allowlistRepository.hasOrigin(origin);
  }

  private async createTab(
    tab: TabState,
  ): Promise<TabState> {
    await this.tabsRepository.setTab(tab);
    await this.notifyTabsUpdated();

    return tab;
  }

  private async updateTab(
    tabId: number,
    patch: Partial<TabState>,
  ): Promise<TabState | undefined> {
    const updated =
      await this.tabsRepository.updateTab(
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
    const updatedTabs =
      await this.tabsRepository.updateTabs(
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

  private async notifyAllowlistUpdated(): Promise<void> {
    await this.contentScriptClient.broadcast({
      type: "ALLOWLIST/UPDATED",
      payload: {
        allowlist: this.getAllowlist(),
      },
    });
  }
}
