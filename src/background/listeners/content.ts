import type { CaptureController } from "../controllers/CaptureController";

import type { ContentScriptService } from "../services/ContentScriptService";
import type { GoogleDocsService } from "../services/GoogleDocsService";
import type { PageService } from "../services/PageService";
import type { PermissionService } from "../services/PermissionService";
import type { SessionService } from "../services/SessionService";
import type { SessionPersistenceService } from "../services/SessionPersistenceService";
import type { StorageService } from "../services/StorageService";
import type { TabService } from "../services/TabService";

import type { AppState } from "@/shared/types";


export function startContentListener(
  storageService: StorageService,
  permissionService: PermissionService,
  pageService: PageService,
  sessionService: SessionService,
  sessionPersistenceService: SessionPersistenceService,
  tabSerive: TabService,
  contentScriptService: ContentScriptService,
  googleDocsService: GoogleDocsService,
  captureController: CaptureController,
) {

  chrome.runtime.onMessage.addListener(
    async (
      message: any,
      sender: chrome.runtime.MessageSender,
    ) => {
      if (!sender.tab || sender.tab.id == null || !sender.tab.url) {
        // log
        return;
      }
      console.log("from content", message)
      switch (message.type) {
        case "APP/GET_INITIAL_STATE":
          const result = await storageService.getNormalizedAppState();

          // navigate or content started
          const initState: AppState = {
            mounted: result.mounted,
            pageState: result.pageState,
            activeSession: result.activeSession,
            tabs: result.tabs,
            sessions: result.sessions,
            tabId: sender.tab.id,
          }
          return initState;
        case "SESSION/START":
          await sessionService.startSession();
          if (sender.tab.url.startsWith("https://docs.google.com/document/")) {
            await googleDocsService.ensureInitialized(sender.tab.id, sender.tab.url);
          }
          break;
        case "SESSION/END":
          await sessionService.endSession();
          break;
        case "SESSION/RENAME":
          await sessionPersistenceService.renameSession(
            message.payload.sessionId,
            message.payload.newTitle,
          );
          break;
        case "SESSION/RETRY":
          break;
        case "SESSIONS/REFRESH":
          sessionPersistenceService.refreshSessions();
          break;
        case "PAGE/EXPAND":
          await pageService.expand();
          break;
        case "PAGE/COLLAPSE":
          await pageService.collapse();
          break;
        case "PAGE/STOP":
          await pageService.showStopConfirmation();
          break;
        case "PAGE/BACK":
          await pageService.cancelStopConfirmation();
          break;
        case "PAGE/FINISH":
          await sessionService.finishSession();
          break;
        case "PAGE/INJECT":
          const tabId = message.payload.tabId;
          const tab = await chrome.tabs.get(tabId);

          if (!tab.url) {
            break;
          }

          const granted = await permissionService.hasScriptingPermission(tab.url);

          if (!granted) {
            break;
          }

          await contentScriptService.ensureReady(tabId);
          break;
        case "SESSION/PAUSE":
          await sessionService.pauseSession();
          break;
        case "SESSION/RESUME":
          await sessionService.resumeSession();
          break;
        case "TAB/INCLUDE":
          if (message.source === "CONTENT") {
            await tabSerive.includeTab(sender.tab.id);
          } else if (message.source === "OPTIONS") {
            await tabSerive.includeTab(message.payload.tabId);
          }
          break;
        case "TAB/EXCLUDE":
          if (message.source === "CONTENT") {
            await tabSerive.excludeTab(sender.tab.id);
          } else if (message.source === "OPTIONS") {
            await tabSerive.excludeTab(message.payload.tabId);
          }
          break;
        case "TAB/OPEN_OPTIONS":
          await chrome.runtime.openOptionsPage();
          break;
        case "TRACE/USER":
          captureController.capture(message.payload.trace, sender.tab.id);
          break;
        case "TRACE/GOOGLE":
          const traces = await googleDocsService.updateDocument(sender.tab.id, message.payload.trace);
          for (const trace of traces) {
            await captureController.capture(trace, sender.tab.id);
          }
          break;
        default:
          break;
      }
    }
  )
}
