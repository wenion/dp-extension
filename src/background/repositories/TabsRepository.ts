import type { TabState } from "@/shared/types";

const STORAGE_KEY = "tabs";

export class TabsRepository {
  private tabs = new Map<number, TabState>();

  async initialize(): Promise<void> {
    const { tabs } =
      await chrome.storage.local.get<{
        tabs?: TabState[];
      }>(STORAGE_KEY);

    this.tabs = new Map(
      (tabs ?? []).map(tab => [
        tab.tabId,
        tab,
      ]),
    );
  }

  getTab(
    tabId: number,
  ): TabState | undefined {
    return this.tabs.get(tabId);
  }

  getTabs(): readonly TabState[] {
    return [...this.tabs.values()];
  }

  async setTab(
    tab: TabState,
  ): Promise<void> {
    this.tabs.set(
      tab.tabId,
      tab,
    );

    await this.persist();
  }

  async setTabs(
    tabs: readonly TabState[],
  ): Promise<void> {
    this.tabs = new Map(
      tabs.map(tab => [
        tab.tabId,
        tab,
      ]),
    );

    await this.persist();
  }

  async updateTab(
    tabId: number,
    updater: (tab: TabState) => TabState,
  ): Promise<TabState | undefined> {
    const tab = this.tabs.get(tabId);

    if (!tab) {
      return;
    }

    const updated = updater(tab);

    this.tabs.set(
      tabId,
      updated,
    );

    await this.persist();

    return updated;
  }

  async updateTabs(
    predicate: (tab: TabState) => boolean,
    updater: (tab: TabState) => TabState,
  ): Promise<TabState[]> {
    const updatedTabs: TabState[] = [];

    for (const [tabId, tab] of this.tabs) {
      if (!predicate(tab)) {
        continue;
      }

      const updated = updater(tab);

      this.tabs.set(
        tabId,
        updated,
      );

      updatedTabs.push(updated);
    }

    if (updatedTabs.length > 0) {
      await this.persist();
    }

    return updatedTabs;
  }

  async removeTab(
    tabId: number,
  ): Promise<boolean> {
    const removed =
      this.tabs.delete(tabId);

    if (removed) {
      await this.persist();
    }

    return removed;
  }

  async clear(): Promise<void> {
    this.tabs.clear();

    await chrome.storage.local.remove(
      STORAGE_KEY,
    );
  }

  hasTab(
    tabId: number,
  ): boolean {
    return this.tabs.has(tabId);
  }

  private async persist(): Promise<void> {
    await chrome.storage.local.set({
      [STORAGE_KEY]: [
        ...this.tabs.values(),
      ],
    });
  }
}
