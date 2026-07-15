import { registerMessageListener } from "./message/listerner";
import { initialize } from "./message/BackgroundClient";
import { overlay } from "./overlay/overlay";
import { CaptureManager } from "./capture";

import type { AppState } from "@/shared/types";
import { captureContext } from "./capture/context";

const capture = new CaptureManager();


init().catch(console.error);
async function init() {
  registerMessageListener(capture);

  const state = await initialize() as AppState;
  state.mounted ? overlay.show(state) : overlay.hide();

  captureContext.initialize({...state});

  const tab = captureContext.getTab();
  if (!tab) {
    return;
  }
  capture.ensureRecording(tab, state.activeSession);
}
