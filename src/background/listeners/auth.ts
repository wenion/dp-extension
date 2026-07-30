import { env } from "@/config/env";

import type { InitializationController } from "../controllers/InitializationController";
import type { NotificationController } from "../controllers/NotificationController";

export function startAuthListener(
  initializationController: InitializationController,
  notificationController: NotificationController,
) {

  chrome.runtime.onMessageExternal.addListener(
    (msg: any, sender: chrome.runtime.MessageSender, sendResponse: (res?: any) => void
  ) => {
    (async () => {
      if (!sender.origin?.startsWith(env.apiUrl)) {
        sendResponse({ ok: false, error: "Unauthorized sender" });
        return;
      }

      if (msg?.type !== "AUTH_CODE") {
        sendResponse({ ok: false, error: "Invalid message type" });
        return;
      }

      try {
        await initializationController.onAuthenticationCompleted(msg.code);
        sendResponse({ ok: true });
      } catch (err) {
          await notificationController.showNotLoggedIn();
          sendResponse({
            ok: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
    })();
  
    return true; // keep channel open for async sendResponse
  });
  
}