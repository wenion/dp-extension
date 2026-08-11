import { env } from "@/config/env";

import type { ExtensionController } from "../controllers/ExtensionController";

export function startExtensionListener(
  extensionController: ExtensionController,
) {

  chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
      chrome.tabs.create({ url: env.apiUrl });
    }
    else if (details.reason === "update") {
    }
    await chrome.storage.local.clear();
  });

  chrome.runtime.onMessageExternal.addListener(
    (msg, sender, sendResponse) => {
      extensionController.handleLoginMessage(
        msg,
        sender,
        sendResponse,
      );

      return true;
    },
  );

  chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) {
      return;
    }

    await extensionController.handleActionClick(tab.id);
  });

  chrome.permissions.onAdded.addListener((permissions) => {
    if (permissions.origins) {
      extensionController.onHostPermissionsAdded(
        permissions.origins,
      );
    }
  });

  chrome.permissions.onRemoved.addListener((permissions) => {
    if (permissions.origins) {
      extensionController.onHostPermissionsRemoved(
        permissions.origins,
      );
    }
  });
}
