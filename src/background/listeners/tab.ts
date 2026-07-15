import { createNavigationTrace, creatPageFocusTrace } from "@/shared/TraceFactory";

import type { CaptureController } from "../controllers/CaptureController";
import type { ContentScriptService } from "../services/ContentScriptService";
import type { GoogleDocsService } from "../services/GoogleDocsService";
import type { PermissionService } from "../services/PermissionService";
import type { TabService } from "../services/TabService";


export function startTabListener(
  tabService: TabService,
  permission: PermissionService,
  contentScriptServicet: ContentScriptService,
  googleDocsService: GoogleDocsService,
  captureController: CaptureController,
) {

  chrome.tabs.onActivated.addListener(async(activeInfo) => {
    const focusTrace = creatPageFocusTrace();
    await captureController.capture(focusTrace, activeInfo.tabId);

    // TODO check tabstate & googledocs
  });

  chrome.tabs.onRemoved.addListener(async (tabId: number) => {
    await tabService.unregisterTab(tabId);

    // TODO remove GoogleDocs
    googleDocsService.removeDocument(tabId);
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!tab.url) {
      return;
    }

    if (changeInfo.status !== "complete") {
      return;
    }

    await tabService.updateTab(tabId, {
      windowId: tab.windowId,
      title: tab.title,
    });

    // add trace - PageNavigationTrace
    const navigationTrace = createNavigationTrace();
    await captureController.capture(navigationTrace, tabId);
    // if source is googledocs, will call googleDocsService
    // if session start
    // when document loaded
    if (tab.url.startsWith("https://docs.google.com/document/")) {
      // await googleDocsService.initializeDocument(tab.id, tab.url);
      await googleDocsService.ensureInitialized(tabId, tab.url);
    }
    else {
      googleDocsService.removeDocument(tabId);
    }

  });

  chrome.webNavigation.onCommitted.addListener(async (details) => {
    if (
      details.transitionType !== "auto_subframe" &&
      details.transitionType !== "manual_subframe"
    ) {
      const hasPermission =
        await permission.hasScriptingPermission(details.url);

      const status = hasPermission ? "recording" : "not_in_scope";
      await tabService.registerTab(
        details.tabId,
        details.url,
        status,
      );
      
      if (status) {
        contentScriptServicet.ensureReady(details.tabId);
      }
    }
  });

}