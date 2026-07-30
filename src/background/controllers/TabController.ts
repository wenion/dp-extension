import type { ContentScriptService } from "../services/ContentScriptService";
import type { TabService } from "../services/TabService";

import {
  InjectionPermission,
  InjectionResult,
} from "@/shared/content-script";
import type { RecordingScope } from "@/shared/types";

export class TabController {
  private contentScriptService: ContentScriptService;
  private tabService: TabService;

  constructor(
    contentScriptService: ContentScriptService,
    tabService: TabService,
  ) {
    this.contentScriptService = contentScriptService;
    this.tabService = tabService;
  }

  async handleNavigation(
    tabId: number,
    urlString: string,
  ) {
    const url = new URL(urlString);

    const permission =
      await this.contentScriptService.checkInjectionPermission(url);

    const canInject =
      permission === InjectionPermission.Allowed;

    await this.tabService.registerTab(
      tabId,
      urlString,
      canInject ? "recording" : "not_in_scope",
    );

    if (canInject) {
      await this.contentScriptService.executeInjection(tabId);
    }
  }

  async handleTabUpdated(
    tabId: number,
    title?: string,
  ) {
    await this.tabService.setTitle(tabId, title);
  }

  async handleTabRemoved(tabId: number) {
    await this.tabService.unregisterTab(tabId);
  }

  async checkOrCreateTab(tabId: number) {
    const tab = this.tabService
      .getTabs()
      .find(tab => tab.tabId === tabId);

    if (tab) {
      return;
    }

    try {
      const chromeTab = await chrome.tabs.get(tabId);

      if (!chromeTab.url) {
        return;
      }

      if (!tab) {
        await this.tabService.registerTab(
          tabId,
          chromeTab.url,
          "not_in_scope",
          chromeTab.title,
          false,
        );
      }
    } catch {
      // Tab no longer exists.
    }
  }

  async updateRecordingScopeByOrigins(
    origins: readonly string[],
    recordingScope: RecordingScope,
  ): Promise<void> {
    await this.tabService.updateRecordingScopeByOrigins(
      origins,
      recordingScope,
    );
  }

  async injectTabsByOrigin(origin: string) {
    const tabs = this.tabService
      .getTabs()
      .filter(tab => tab.origin === origin);

    for (const tab of tabs) {
      const result = await this.contentScriptService.executeInjection(tab.tabId);

      if (result !== InjectionResult.Success) {
        this.tabService.setDisconnected(tab.tabId);
      }
    }
  }
}
