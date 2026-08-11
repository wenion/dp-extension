import type { CaptureController } from "../controllers/CaptureController";
import type { ExtensionController } from "../controllers/ExtensionController";
import type { GoogleDocsController } from "../controllers/GoogleDocsController";
import type { OptionsController } from "../controllers/OptionsController";

export function startContentListener(
  captureController: CaptureController,
  extensionController: ExtensionController,
  googleDocsController: GoogleDocsController,
  optionsController: OptionsController,
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
      console.log("message", message)
      switch (message.type) {
        case "CONTENT/CONNECT":
          extensionController.onContentConnected(sender.tab.id);
          break;
        case "OPTIONS/CONNECT":
          extensionController.onOptionsConnected();
          break;
        case "SESSION/START": {
          await extensionController.startRecording();
          // await recordingController.startRecording();
          // await googleDocsController.replaceAll();
          // const startTrace = createSessionStartTrace();
          // await captureController.capture(
          //   startTrace,
          //   sender.tab.id,
          //   { ignoreRecordingScope: true },
          // );
          break;
        }
        case "PANEL/EXPAND":
          await extensionController.expand();
          break;
        case "PANEL/COLLAPSE":
          await extensionController.collapse();
          break;
        case "SESSION/PAUSE":
          await extensionController.pauseRecording();
          break;
        case "SESSION/RESUME":
          await extensionController.resumeRecording();
          break;
        case "SESSION/END_REQUEST":
          await extensionController.endRequested();
          break;
        case "SESSION/END": {
          // const startTrace = createSessionEndTrace();
          // await captureController.capture(
          //   startTrace,
          //   sender.tab.id,
          //   { ignoreRecordingScope: true },
          // );
          // await recordingController.endRecording();
          await extensionController.endRecording();
          break;
        }
        case "SESSION/END_REQUEST_CANCELLED": {
          await extensionController.expand();
          break;
        }
        case "SESSION/EXIT": {
          await extensionController.exitRecording();
          // const startTrace = createSessionEndTrace();
          // await captureController.capture(
          //   startTrace,
          //   sender.tab.id,
          //   { ignoreRecordingScope: true },
          // );
          // if (message.source === "CONTENT") {
          //   await recordingController.exitRecording(
          //     sender.tab.id
          //   );
          // } else {
          //   await recordingController.exitRecording();
          // }
          break;
        }
        case "SESSION/EXIT_REQUEST_CANCELLED": {
          await extensionController.expand();
          break;
        }
        case "SESSION/UPLOADED_DONE":
          await extensionController.finalizeRecording();
          break;
        case "SESSION/UPLOAD_FAILED_DONE":
          await extensionController.finalizeRecordingFailed();
          break;
        case "TAB/INCLUDE": {
          let tabId =
            message.source === "CONTENT"
              ? sender.tab.id
              : message.payload.tabId;
          
          await extensionController.setTabRecording(tabId);
          break;
        }
        case "TAB/EXCLUDE": {
          let tabId =
            message.source === "CONTENT"
              ? sender.tab.id
              : message.payload.tabId;
          await extensionController.setTabExcluded(tabId);
          break;
        }
        case "OPTIONS/TOGGLE_MOUNT": {
          await extensionController.toggleMount();
          break;
        }
        case "OPTIONS/NAME_SESSION":
          await extensionController.setActiveSessionName(
            message.payload.newTitle,
          );
          break;
        case "OPTIONS/RENAME_SESSION": {
          const result =
            await optionsController.rename(
              message.payload.sessionId,
              message.payload.newTitle,
            );
          sendResponse(result);
          break;
        }
        case "OPTIONS/RETRY_SESSION": {
          const result =
            await extensionController.reuploadRecording(
              message.payload.sessionId,
            );
          sendResponse(result);
          break;
        }
        case "OPTIONS/DISMISS_NOTIFICATION": {
          extensionController.dismissNotification(message.payload.notificationId);
          break;
        }
        case "SESSION/OPEN": {
          optionsController.openSession(message.payload.sessionId);
          break;
        }
        case "TABS/GRANTED":
          await extensionController.injectContentScriptsByOrigin(
            message.payload.origin
          );
          break;
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
        default:
          break;
      }
    }
  )
}
