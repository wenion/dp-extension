import type { CaptureController } from "../controllers/CaptureController";
import type { ExtensionController } from "../controllers/ExtensionController";
import type { OptionsController } from "../controllers/OptionsController";

import type {
  ContentEvent,
} from "@/shared/messaging/contentProtocol";
import type {
  OptionsEvent,
} from "@/shared/messaging/optionsProtocol";

async function routeOptionsEvent(
  message: OptionsEvent,
  extensionController: ExtensionController,
  optionsController: OptionsController,
) {
  switch (message.type) {
    case "OPTIONS/CONNECT":
      return extensionController.getOptionsState();

    case "SESSION/START":
      await extensionController.startRecording();
      return;

    case "SESSION/PAUSE":
      await extensionController.pauseRecording();
      return;

    case "SESSION/RESUME":
      await extensionController.resumeRecording();
      return;

    case "SESSION/END_REQUEST":
      await extensionController.endRequested();
      return;

    case "SESSION/END":
      await extensionController.endRecording();
      return;

    case "SESSION/END_REQUEST_CANCELLED":
      await extensionController.expand();
      return;

    case "SESSION/EXIT":
      await extensionController.exitRecording();
      return;

    case "SESSION/EXIT_REQUEST_CANCELLED":
      await extensionController.expand();
      return;

    case "SESSION/UPLOADED_DONE":
      await extensionController.finalizeRecording();
      return;

    case "SESSION/UPLOAD_FAILED_DONE":
      await extensionController.finalizeRecordingFailed();
      return;

    case "TAB/INCLUDE":
      await extensionController.setTabRecording(
        message.payload.tabId,
      );
      return;

    case "TAB/EXCLUDE":
      await extensionController.setTabExcluded(
        message.payload.tabId,
      );
      return;

    case "OPTIONS/TOGGLE_MOUNT":
      await extensionController.toggleMount();
      return;

    case "OPTIONS/NAME_SESSION": {
      const session =
        await extensionController.setActiveSessionName(
          message.payload.name,
        );

      return session;
    }
    case "OPTIONS/RETRY_SESSION": {
      const result =
        await extensionController.reuploadRecording(
          message.payload.sessionId,
        );

      return result !== undefined;
    }

    case "OPTIONS/DISMISS_NOTIFICATION":
      extensionController.dismissNotification(
        message.payload.notificationId,
      );
      return;

    case "OPTIONS/PROMPT_TEMPORARY_PERMISSION":
      return;

    case "OPTIONS/ALLOWLIST_ADD":
    case "OPTIONS/ALLOWLIST_REMOVE":
    case "OPTIONS/OPEN_SESSION":
    case "OPTIONS/RENAME_SESSION":
    case "OPTIONS/SET_PAGE": {
      await optionsController.handleOptionsEvent(
        message,
      );
      return;
    }
  }
}

async function routeContentEvent(
  message: ContentEvent,
  sender: chrome.runtime.MessageSender,
  captureController: CaptureController,
  extensionController: ExtensionController,
) {
  const tab = sender.tab;

  if (tab?.id == null || !tab.url) {
    throw new Error("Invalid sender tab");
  }

  const tabId = tab.id;

  switch (message.type) {
    case "CONTENT/CONNECT":
      return extensionController.getContentState(
        tabId,
      );

    case "CAPTURE/STARTED":
      await captureController.onCaptureStarted(
        tabId,
      );
      return;

    case "CAPTURE/STOPPED":
      await captureController.onCaptureStopped(
        tabId,
      );
      return;

    case "SESSION/START":
      await extensionController.startRecording();
      return;

    case "PANEL/EXPAND":
      await extensionController.expand();
      return;

    case "PANEL/COLLAPSE":
      await extensionController.collapse();
      return;

    case "SESSION/PAUSE":
      await extensionController.pauseRecording();
      return;

    case "SESSION/RESUME":
      await extensionController.resumeRecording();
      return;

    case "SESSION/END_REQUEST":
      await extensionController.endRequested();
      return;

    case "SESSION/END":
      await extensionController.endRecording();
      return;

    case "SESSION/END_REQUEST_CANCELLED":
      await extensionController.expand();
      return;

    case "SESSION/EXIT":
      await extensionController.exitRecording();
      return;

    case "SESSION/EXIT_REQUEST_CANCELLED":
      await extensionController.expand();
      return;

    case "SESSION/UPLOADED_DONE":
      await extensionController.finalizeRecording();
      return;

    case "SESSION/UPLOAD_FAILED_DONE":
      await extensionController.finalizeRecordingFailed();
      return;

    case "TAB/INCLUDE":
      await extensionController.setTabRecording(
        tabId,
      );
      return;

    case "TAB/EXCLUDE":
      await extensionController.setTabExcluded(
        tabId,
      );
      return;

    case "TAB/OPEN_OPTIONS":
      await chrome.runtime.openOptionsPage();
      return;

    case "TAB/ADD_TO_ALLOWLIST":
      await extensionController.addToAllowlist(
        tabId,
      );
      return;

    case "TAB/PROMPT_HOST_PERMISSION":
      await extensionController.promptHostPermission(
        tabId,
      );
      return;

    case "TRACE/USER":
      await captureController.capture(
        message.payload.trace,
        tabId,
      );
      return;

    case "TRACE/GOOGLE":
      await captureController.captureGoogleDocs(
        message.payload.trace,
        tabId,
      );
      return;
  }

  return;
}

export function startContentListener(
  captureController: CaptureController,
  extensionController: ExtensionController,
  optionsController: OptionsController,
) {
  chrome.runtime.onMessage.addListener(
    (
      message: any,
      sender: chrome.runtime.MessageSender,
    ) => {
      if (message.source === "OPTIONS") {
        return routeOptionsEvent(
          message as OptionsEvent,
          extensionController,
          optionsController,
        );
      }

      if (message.source === "CONTENT") {
        return routeContentEvent(
          message as ContentEvent,
          sender,
          captureController,
          extensionController,
        );
      }
    },
  );
}
