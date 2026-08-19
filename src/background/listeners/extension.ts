import type { ExtensionController } from "../controllers/ExtensionController";

export function startExtensionListener(
  extensionController: ExtensionController,
) {

  chrome.runtime.onInstalled.addListener(
    details => extensionController.handleInstalled(details),
  );

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

  chrome.contextMenus.onClicked.addListener(
    (info, tab) =>
      extensionController.handleContextMenuClicked(
        info,
        tab,
      ),
  );
}
