import { AuthService } from "../services/AuthService";


export function startAuthListener(
  url: string,
  authService: AuthService,
) {

  chrome.runtime.onMessageExternal.addListener(
    (msg: any, sender: chrome.runtime.MessageSender, sendResponse: (res?: any) => void
  ) => {
    (async () => {
      try {
        if (!sender.origin?.startsWith(url)) {
          sendResponse({ ok: false, error: "Unauthorized sender" });
          return;
        }
  
        if (msg?.type !== "AUTH_CODE") {
          sendResponse({ ok: false, error: "Invalid message type" });
          return;
        }

        await authService.completeLogin(msg.code);

        await authService.bootstrap();
  
        sendResponse({ ok: true });
      } catch (err) {
          console.error("onMessageExternal failed:", err);
          sendResponse({
            ok: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
    })();
  
    return true; // keep channel open for async sendResponse
  });
  
}