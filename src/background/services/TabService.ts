import type { Storage } from "../storage/Storage";
import type { ContentScriptClient } from "../clients/ContentScriptClient";

import type {
  RecordingStatus,
  TabState,
} from "@/shared/types";


export function getGoogleDocumentId(url?: string): string | undefined {
  return url?.match(/\/d\/([^/]+)/)?.[1];
}

export class TabService {
  private readonly storage: Storage;
  private readonly contentScriptClient: ContentScriptClient;

  constructor(
    storage: Storage,
    contentScriptClient: ContentScriptClient,
  ) {
    this.storage = storage;
    this.contentScriptClient = contentScriptClient;
  }

  async registerTab(
    tabId: number,
    url: string,
    status: RecordingStatus,
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
      googleDocId: getGoogleDocumentId(url),
      url: url,
      origin,
      recordingStatus: status,
      createdAt: now,
      updatedAt: now,
    }

    await this.setTab(tabState);

    return tabState;
  }

  async unregisterTab(tabId: number) {
    await this.storage.removeTab(tabId);

    await this.notifyTabsUpdated();
  }

  async updateTab(
    tabId: number,
    patch: Partial<TabState>,
  ) {
    const tab = this.storage.getTab(tabId);

    if (!tab) {
      return;
    }

    const updated: TabState = {
      ...tab,
      ...patch,
      updatedAt: Date.now(),
    };

    await this.setTab(updated);

    return updated;
  }

  async excludeTab(tabId: number) {
    await this.updateTab(
      tabId,
      {
        recordingStatus: "excluded",
      }
    )
  }

  async includeTab(tabId: number) {
    await this.updateTab(
      tabId,
      {
        recordingStatus: "recording",
      }
    )
  }

  getTab(tabId: number) {
    return this.storage.getTab(tabId);
  }

  getTabs() {
    return this.storage.getTabs();
  }

  hasTab(tabId: number) {
    return this.storage.getTab(tabId) !== undefined;
  }

  isRecording(tabId: number) {
    return (
      this.storage.getTab(tabId)?.recordingStatus ===
      "recording"
    );
  }

  private async setTab(tab: TabState) {
    await this.storage.setTab(tab);

    await this.notifyTabsUpdated();
  }

  async cleanupClosedTabs() {
    const chromeTabs = await chrome.tabs.query({});

   const chromeTabIds = new Set(
      chromeTabs
        .filter(
          (
            tab,
          ): tab is chrome.tabs.Tab & { id: number } =>
            tab.id !== undefined,
        )
        .map((tab) => tab.id),
    );

    for (const tab of this.storage.getTabs()) {
      if (!chromeTabIds.has(tab.tabId)) {
        await this.storage.removeTab(tab.tabId);
      }
    }

    await this.notifyTabsUpdated();
  }

  async handlePermissionChange(
    origins: readonly string[],
    granted: boolean,
  ): Promise<void> {
    const changed = await this.updateRecordingStatus(
      origins,
      granted,
    );

    if (!changed) {
      return;
    }

    await this.notifyTabsUpdated();
  }

  private async updateRecordingStatus(
    origins: readonly string[],
    granted: boolean,
  ): Promise<boolean> {
    const tabs = this.storage.getTabs();

    const originSet = new Set(origins);

    const nextStatus = granted
      ? "recording"
      : "not_in_scope";

    let changed = false;

    for (const tab of tabs) {
      if (!originSet.has(`${tab.origin}/*`)) {
        continue;
      }

      if (tab.recordingStatus === nextStatus) {
        continue;
      }

      tab.recordingStatus = nextStatus;
      changed = true;
    }

    if (!changed) {
      return false;
    }

    await this.storage.setTabs(tabs);

    return true;
  }

  private async notifyTabsUpdated() {
    await this.contentScriptClient.broadcast({
      type: "TABS/UPDATED",
      payload: this.getTabs(),
    });
  }
}
