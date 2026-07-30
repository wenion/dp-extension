import {
  createNavigationTrace,
  createPageFocusTrace,
} from "@/shared/TraceFactory";

import type { CaptureController } from "../controllers/CaptureController";
import type { GoogleDocsController } from "../controllers/GoogleDocsController";
import type { TabController } from "../controllers/TabController";

export function startTabListener(
  captureController: CaptureController,
  googleDocsController: GoogleDocsController,
  tabController: TabController,
) {

  chrome.tabs.onActivated.addListener(async(activeInfo) => {
    const createdTrace = createPageFocusTrace();
    await captureController.capture(createdTrace, activeInfo.tabId);

    await tabController.checkOrCreateTab(activeInfo.tabId);
  });

  chrome.tabs.onRemoved.addListener(async (tabId: number) => {
    await tabController.handleTabRemoved(tabId);
    googleDocsController.remove(tabId);
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!tab.url) {
      return;
    }

    if (changeInfo.status !== "complete") {
      return;
    }

    await tabController.handleTabUpdated(tabId, tab.title);

    const content =
      await googleDocsController.initialize(tabId, tab.url);

    const navigationTrace = createNavigationTrace(content);
    await captureController.capture(navigationTrace, tabId);
  });

  chrome.webNavigation.onCommitted.addListener(async (details) => {
    if (
      details.transitionType === "auto_subframe" ||
      details.transitionType === "manual_subframe"
    ) {
      return;
    }

    console.log("webNavigation")
    await tabController.handleNavigation(
      details.tabId,
      details.url
    );
  });
}
