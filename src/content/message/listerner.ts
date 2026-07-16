import { CaptureManager } from "../capture";
import { captureContext } from "../capture/context";
import { overlay } from "../overlay/overlay";
import { showDialog } from "../overlay/showDialog";


export function registerMessageListener(capture: CaptureManager) {
  function syncCapture() {
    const tab = captureContext.getTab();

    if (!tab) {
      return;
    }

    capture.ensureRecording(
      tab,
      captureContext.getActiveSession(),
    );
  }

  chrome.runtime.onMessage.addListener(
    (
      msg: any,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (res?: any) => void
    ) => {
      switch (msg.type) {
        case "PAGE/MOUNTED":
          overlay.show(msg.payload);
          break;
        case "PAGE/UNMOUNTED":
          overlay.hide();
          // TODO
          if (msg.payload === captureContext.getTab()?.tabId) {
            showDialog();
          }
          break;
        case "PING":
          sendResponse({
            ok: true,
            from: "content-script",
            at: new Date().toISOString()
          });
          break;
        case "TABS/UPDATED":
          captureContext.setTabs(msg.payload);
          syncCapture();
          break;
        case "SESSION/UPDATED":
          captureContext.setActiveSession(msg.payload);
          syncCapture();
          break;
        case "PAGE_STATE/UPDATED":
          // if (msg.payload === "forceUploaded") {
          //   showDialog();
          // }
          break;
        default:
          break;
      }
    }
  );
}