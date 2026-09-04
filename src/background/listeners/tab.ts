import { extractGoogleDocsId } from "@/shared/utils";

import type { ExtensionController } from "../controllers/ExtensionController";

export function startTabListener(
  extensionController: ExtensionController,
) {
  chrome.tabs.onActivated.addListener(
    async(activeInfo) => {
      await extensionController.handleTabActivated(activeInfo.tabId);
    },
  );

  chrome.tabs.onRemoved.addListener(
    async (tabId: number) => {
      await extensionController.handleTabRemoved(tabId);
    },
  );

  chrome.tabs.onUpdated.addListener(
    async (tabId, changeInfo, tab) => {
      if (!tab.url) {
        return;
      }

      if (changeInfo.status !== "complete") {
        return;
      }

      await extensionController.handleTabUpdated(
        tabId,
        tab.windowId,
        tab.title,
        extractGoogleDocsId(tab.url),
      );
    },
  );

  chrome.webNavigation.onCommitted.addListener(
    async (details) => {
      if (
        details.transitionType === "auto_subframe" ||
        details.transitionType === "manual_subframe"
      ) {
        return;
      }

      await extensionController.handleTabNavigated(
        details.tabId,
        details.url
      );
    },
  );
}
