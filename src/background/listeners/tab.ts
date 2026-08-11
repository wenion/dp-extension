import {
  createNavigationTrace,
  createPageFocusTrace,
} from "@/shared/TraceFactory";

import type { CaptureController } from "../controllers/CaptureController";
import type { ExtensionController } from "../controllers/ExtensionController";
import type { GoogleDocsController } from "../controllers/GoogleDocsController";

export function startTabListener(
  captureController: CaptureController,
  extensionController: ExtensionController,
  googleDocsController: GoogleDocsController,
) {
  chrome.tabs.onActivated.addListener(async(activeInfo) => {
    await extensionController.handleTabActivated(activeInfo.tabId);

    const createdTrace = createPageFocusTrace();
    await captureController.capture(createdTrace, activeInfo.tabId);
  });

  chrome.tabs.onRemoved.addListener(async (tabId: number) => {
    await extensionController.handleTabRemoved(tabId);
    googleDocsController.remove(tabId);
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!tab.url) {
      return;
    }

    if (changeInfo.status !== "complete") {
      return;
    }

    await extensionController.handleTabUpdated(tabId, tab.title);

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

    await extensionController.handleTabNavigated(
      details.tabId,
      details.url
    );
  });
}
