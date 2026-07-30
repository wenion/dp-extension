import { CaptureManager } from "../capture";
import { captureContext } from "../capture/context";
import { overlay } from "../overlay/overlay";
import { showDialog } from "../overlay/showDialog";

import { connect } from "./BackgroundClient";

import type { ContentState, TabState } from "@/shared/types";

export function registerMessageListener(capture: CaptureManager) {
  chrome.runtime.onMessage.addListener(
    (
      msg: any,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (res?: any) => void
    ) => {
      switch (msg.type) {
        case "CONTENT/INITIALIZED": {
          const state = msg.payload as ContentState;
          if (state.pageMounted) {
            overlay.show(state);
          } else {
            overlay.hide();
          }

          captureContext.initialize({...state});
          const tab = captureContext.getTab();
          if (!tab) {
            return;
          }
          if (tab.recordingScope === "recording" && state.activeSession) {
            capture.mount(tab.url);
          } else {
            capture.unmount();
          }
          break;
        }
        case "PAGE/MOUNTED":
          connect();
          break;
        case "PAGE/UNMOUNTED":
          overlay.hide();
          // TODO
          if (msg.payload === captureContext.getTab()?.tabId) {
            showDialog("Session stopped & uploaded. Extension turned off.");
          }
          break;
        case "PING":
          sendResponse({
            injected: true,
          });
          break;
        case "TABS/UPDATED": {
          captureContext.setTabs(msg.payload);
          const tabs = msg.payload as TabState[];
          const tab = tabs.find(tab => tab.tabId === captureContext.getTab()?.tabId);
          const activateSession = captureContext.getActiveSession();
          if (tab?.recordingScope === "recording" && activateSession) {
            capture.mount(tab.url);
          } else {
            capture.unmount();
          }
          break;
        }
        case "SESSION/UPDATED": {
          captureContext.setActiveSession(msg.payload);

          const url = captureContext.getTab()?.url;
          const ableRecord = captureContext.getTab()?.recordingScope === "recording";

          if (msg.payload && ableRecord && url) {
            capture.mount(url);
          } else {
            capture.unmount();
          }
          break;
        }
        case "PAGE/SHOW":
          if (msg.payload.tabId === captureContext.getTab()?.tabId) {
            showDialog(
              msg.payload.message,
            );
          }
          break;
        default:
          break;
      }
    }
  );
}