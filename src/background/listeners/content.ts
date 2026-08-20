import type { CaptureController } from "../controllers/CaptureController";
import type { ExtensionController } from "../controllers/ExtensionController";
import type { OptionsController } from "../controllers/OptionsController";

import type {
  ContentEvent,
} from "@/shared/message/contentEvents";
import type {
  OptionsEvent,
} from "@/shared/message/optionsEvents";

async function routeOptionsEvent(
  message: OptionsEvent,
  sendResponse: (response?: any) => void,
  extensionController: ExtensionController,
  optionsController: OptionsController,
): Promise<void> {
  switch (message.type) {
    case "OPTIONS/CONNECT":
      await extensionController.onOptionsConnected();
      break;

    case "SESSION/START":
      await extensionController.startRecording();
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

    case "SESSION/END":
      await extensionController.endRecording();
      break;

    case "SESSION/END_REQUEST_CANCELLED":
      await extensionController.expand();
      break;

    case "SESSION/EXIT":
      await extensionController.exitRecording();
      break;

    case "SESSION/EXIT_REQUEST_CANCELLED":
      await extensionController.expand();
      break;

    case "SESSION/UPLOADED_DONE":
      await extensionController.finalizeRecording();
      break;

    case "SESSION/UPLOAD_FAILED_DONE":
      await extensionController.finalizeRecordingFailed();
      break;

    case "TAB/INCLUDE":
      await extensionController.setTabRecording(
        message.payload.tabId,
      );
      break;

    case "TAB/EXCLUDE":
      await extensionController.setTabExcluded(
        message.payload.tabId,
      );
      break;

    // case "TABS/GRANTED":
    //   await extensionController.injectContentScriptsByOrigin(
    //     message.payload.origin,
    //   );
    //   break;

    case "OPTIONS/TOGGLE_MOUNT":
      await extensionController.toggleMount();
      break;

    case "OPTIONS/NAME_SESSION":
      await extensionController.setActiveSessionName(
        message.payload.name,
      );
      break;

    case "OPTIONS/RETRY_SESSION": {
      const result =
        await extensionController.reuploadRecording(
          message.payload.sessionId,
        );

      sendResponse({
        success: result !== undefined,
      });

      break;
    }

    case "OPTIONS/DISMISS_NOTIFICATION":
      extensionController.dismissNotification(
        message.payload.notificationId,
      );
      break;

    case "OPTIONS/ALLOWLIST_REMOVE":
    case "OPTIONS/OPEN_SESSION":
    case "OPTIONS/RENAME_SESSION":
    case "OPTIONS/SET_PAGE": {
      try {
        await optionsController.handleOptionsEvent(
          message,
        );

        sendResponse({
          success: true,
        });
      }
      catch (error) {
        console.error(
          "Failed to handle options event:",
          error,
        );

        sendResponse({
          success: false,
        });
      }

      break;
    }
  }
}

async function routeContentEvent(
  message: ContentEvent,
  sender: chrome.runtime.MessageSender,
  captureController: CaptureController,
  extensionController: ExtensionController,
): Promise<void> {
  if (
    !sender.tab ||
    sender.tab.id == null ||
    !sender.tab.url
  ) {
    return;
  }

  const tabId = sender.tab.id;

  switch (message.type) {
    case "CONTENT/CONNECT":
      await extensionController.onContentConnected(
        tabId,
      );
      break;

    case "CAPTURE/STARTED":
      await captureController.onCaptureStarted(
        tabId,
      );
      break;

    case "CAPTURE/STOPPED":
      await captureController.onCaptureStopped(
        tabId,
      );
      break;

    case "SESSION/START":
      await extensionController.startRecording();
      break;

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

    case "SESSION/END":
      await extensionController.endRecording();
      break;

    case "SESSION/END_REQUEST_CANCELLED":
      await extensionController.expand();
      break;

    case "SESSION/EXIT":
      await extensionController.exitRecording();
      break;

    case "SESSION/EXIT_REQUEST_CANCELLED":
      await extensionController.expand();
      break;

    case "SESSION/UPLOADED_DONE":
      await extensionController.finalizeRecording();
      break;

    case "SESSION/UPLOAD_FAILED_DONE":
      await extensionController.finalizeRecordingFailed();
      break;

    case "TAB/INCLUDE":
      await extensionController.setTabRecording(
        tabId,
      );
      break;

    case "TAB/EXCLUDE":
      await extensionController.setTabExcluded(
        tabId,
      );
      break;

    case "TAB/OPEN_OPTIONS":
      await chrome.runtime.openOptionsPage();
      break;

    case "TAB/ADD_TO_ALLOWLIST":
      await extensionController.addToAllowlist(
        tabId,
      );
      break;

    case "TAB/PROMPT_HOST_PERMISSION":
      await extensionController.promptHostPermission(
        tabId,
      );
      break;

    case "TRACE/USER":
      await captureController.capture(
        message.payload.trace,
        tabId,
      );
      break;

    case "TRACE/GOOGLE":
      await captureController.captureGoogleDocs(
        message.payload.trace,
        tabId,
      );
      break;

  }
}

export function startContentListener(
  captureController: CaptureController,
  extensionController: ExtensionController,
  optionsController: OptionsController,
) {
  chrome.runtime.onMessage.addListener(
    async (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void,
    ) => {
      if (message.source === "OPTIONS") {
        await routeOptionsEvent(
          message as OptionsEvent,
          sendResponse,
          extensionController,
          optionsController,
        );

        return;
      }

      if (message.source === "CONTENT") {
        await routeContentEvent(
          message as ContentEvent,
          sender,
          captureController,
          extensionController,
        );

        return;
      }
    }
  )
}
