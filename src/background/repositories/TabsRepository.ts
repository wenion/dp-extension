import type { TabState } from "@/shared/types";

export class TabsRepository {
  private tabs = new Map<number, TabState>();

  getTab(tabId: number): TabState | undefined {
    return this.tabs.get(tabId);
  }

  getTabs(): readonly TabState[] {
    return [...this.tabs.values()];
  }

  setTab(tab: TabState): void {
    this.tabs.set(tab.tabId, tab);
  }

  setTabs(tabs: readonly TabState[]): void {
    this.tabs = new Map(
      tabs.map(tab => [tab.tabId, tab])
    );
  }

  updateTab(
    tabId: number,
    updater: (tab: TabState) => TabState,
  ): TabState | undefined {
    const tab = this.tabs.get(tabId);

    if (!tab) {
      return;
    }

    const updated = updater(tab);

    this.tabs.set(tabId, updated);

    return updated;
  }

  updateTabs(
    predicate: (tab: TabState) => boolean,
    updater: (tab: TabState) => TabState,
  ): void {
    for (const [tabId, tab] of this.tabs) {
      if (!predicate(tab)) {
        continue;
      }

      this.tabs.set(
        tabId,
        updater(tab),
      );
    }
  }

  removeTab(tabId: number): boolean {
    return this.tabs.delete(tabId);
  }

  clear(): void {
    this.tabs.clear();
  }

  hasTab(tabId: number): boolean {
    return this.tabs.has(tabId);
  }
}