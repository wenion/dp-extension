import type { CaptureController } from "../controllers/CaptureController";
import type { ContentController } from "../controllers/ContentController";
import type { GoogleDocsController } from "../controllers/GoogleDocsController";
import type { OptionsController } from "../controllers/OptionsController";
import type { RecordingController } from "../controllers/RecordingController";
import type { NotificationController } from "../controllers/NotificationController";
import type { TabController } from "../controllers/TabController";

export function startContentListener(
  captureController: CaptureController,
  contentController: ContentController,
  googleDocsController: GoogleDocsController,
  optionsController: OptionsController,
  recordingController: RecordingController,
  notificationController: NotificationController,
  tabController: TabController,
) {
  chrome.runtime.onMessage.addListener(
    async (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void,
    ) => {
      if (!sender.tab || sender.tab.id == null || !sender.tab.url) {
        return;
      }
      switch (message.type) {
        case "CONTENT/CONNECT":
          contentController.onContentConnected(sender.tab.id);
          break;
        case "OPTIONS/CONNECT":
          optionsController.onOptionsConnected();
          break;
        case "OPTIONS/MOUNT":
          optionsController.mount();
          break;
        case "SESSION/START":
          await recordingController.startRecording();
          await googleDocsController.replaceAll();
          break;
        case "SESSION/END":
          await recordingController.endRecording();
          break;
        case "SESSION/EXIT": {
          if (message.source === "CONTENT") {
            await recordingController.exitRecording(
              sender.tab.id
            );
          } else {
            await recordingController.exitRecording();
          }
          break;
        }
        case "SESSION/NAME":
          await recordingController.nameRecording(
            message.payload.newTitle,
          );
          break;
        case "SESSION/RENAME":
          try {
            const session =
              await optionsController.rename(
                message.payload.sessionId,
                message.payload.newTitle,
              );

            sendResponse(session);
          } catch {
            await notificationController.showRenameFailed();

            sendResponse(undefined);
          }
          break;
        case "SESSION/RETRY":
          try {
            const session =
              await recordingController.reuploadRecording(
                message.payload.sessionId
              );
            sendResponse(session);
          } catch {
            await notificationController.showReuploadFailed();
            sendResponse(undefined);
          }
          break;
        case "SESSION/OPEN":
          optionsController.openSession(message.payload.sessionId);
          break;
        // case "SESSIONS/REFRESH":
        //   sessionPersistenceService.refreshSessions();
        //   break;
        case "PAGE/EXPAND":
          await contentController.expand();
          break;
        case "PAGE/COLLAPSE":
          await contentController.collapse();
          break;
        case "PAGE/STOP":
          await recordingController.stopRecording();
          break;
        case "PAGE/BACK":
          await recordingController.cancelStopRecording();
          break;
        case "SESSION/FINISH_UPLOADED":
          await recordingController.finalizeRecording();
          break;
        case "SESSION/FINISH_FAILED":
          await recordingController.finalizeRecordingFailed();
          break;
        case "TABS/GRANTED":
          await tabController.injectTabsByOrigin(message.payload.origin);
          break;
        case "SESSION/PAUSE":
          await recordingController.pauseRecording();
          break;
        case "SESSION/RESUME":
          await recordingController.resumeRecording();
          break;
        case "TAB/INCLUDE": {
          let tabId =
            message.source === "CONTENT"
              ? sender.tab.id
              : message.payload.tabId;
          
          await contentController.includeTab(tabId);
          break;
        }
        case "TAB/EXCLUDE": {
          let tabId =
            message.source === "CONTENT"
              ? sender.tab.id
              : message.payload.tabId;
          await contentController.excludeTab(tabId);
          break;
        }
        case "TAB/OPEN_OPTIONS":
          await chrome.runtime.openOptionsPage();
          break;
        case "TRACE/USER":
          captureController.capture(message.payload.trace, sender.tab.id);
          break;
        case "TRACE/GOOGLE":
          const traces = await googleDocsController.updateDocument(sender.tab.id, message.payload.trace);
          await captureController.captureMany(traces, sender.tab.id);
          break;
        case "NOTIFICATION/DISMISS":
          notificationController.dismissNotification(message.payload.notificationId);
          break;
        default:
          break;
      }
    }
  )
}
