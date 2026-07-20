import type { CaptureController } from "../controllers/CaptureController";

import type { AuthService } from "../services/AuthService";
import type { ContentScriptService } from "../services/ContentScriptService";
import type { GoogleDocsService } from "../services/GoogleDocsService";
import type { PageService } from "../services/PageService";
import type { PermissionService } from "../services/PermissionService";
import type { SessionService } from "../services/SessionService";
import type { SessionPersistenceService } from "../services/SessionPersistenceService";
import type { StorageService } from "../services/StorageService";
import type { TabService } from "../services/TabService";

import type { InitState } from "@/shared/types";


export function startContentListener(
  url: string,
  authService: AuthService,
  storageService: StorageService,
  permissionService: PermissionService,
  pageService: PageService,
  sessionService: SessionService,
  sessionPersistenceService: SessionPersistenceService,
  tabService: TabService,
  contentScriptService: ContentScriptService,
  googleDocsService: GoogleDocsService,
  captureController: CaptureController,
) {

  chrome.runtime.onMessage.addListener(
    async (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void,
    ) => {
      if (!sender.tab || sender.tab.id == null || !sender.tab.url) {
        // log
        return;
      }
      switch (message.type) {
        case "APP/GET_INITIAL_STATE":
          const result =
            await storageService.getNormalizedAppState();

          // navigate or content started
          const setupState: InitState = {
            mounted: result.mounted,
            pageState: result.pageState,
            activeSession: result.activeSession,
            tabs: result.tabs,
            sessions: result.sessions,
            tabId: sender.tab.id,
          }

          sendResponse(setupState);
          return;
          // return initState;
        case "APP/MOUNT":
          // TODO
          if (!authService.isAuthenticated()) {
            await authService.openLogin(url);
            return;
          }

          const session = sessionService.getActiveSession();
          if (session) {
            await pageService.showExitConfirmation();
            return;
          }

          await pageService.mount(sender.tab.id);
          break;
        case "SESSION/START":
          await sessionService.startSession();
          if (sender.tab.url.startsWith("https://docs.google.com/document/")) {
            await googleDocsService.ensureInitialized(sender.tab.id, sender.tab.url);
          }
          break;
        case "SESSION/END":
          await sessionService.endSession();
          break;
        case "SESSION/FORCE_END":
          if (message.source === "CONTENT") {
            await sessionService.forceEndSession(sender.tab.id);
            return;
          }
          await sessionService.forceEndSession();
          break;
        case "SESSION/RENAME":
          await sessionPersistenceService.renameSession(
            message.payload.sessionId,
            message.payload.newTitle,
          );
          break;
        case "SESSION/RETRY":
          break;
        case "SESSION/OPEN":
          const link = new URL(url);
          link.pathname="session";
          link.searchParams.set("clientId", message.payload.sessionId);
          chrome.tabs.create({
            url: link.toString()
          })
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
          const injected =
            await contentScriptService.ensureInjected(tabId);

          sendResponse({ injected, });
          break;
        case "SESSION/PAUSE":
          await sessionService.pauseSession();
          break;
        case "SESSION/RESUME":
          await sessionService.resumeSession();
          break;
        case "TAB/INCLUDE":
          if (message.source === "CONTENT") {
            await tabService.includeTab(sender.tab.id);
          } else if (message.source === "OPTIONS") {
            await tabService.includeTab(message.payload.tabId);
          }
          break;
        case "TAB/EXCLUDE":
          if (message.source === "CONTENT") {
            await tabService.excludeTab(sender.tab.id);
          } else if (message.source === "OPTIONS") {
            await tabService.excludeTab(message.payload.tabId);
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
