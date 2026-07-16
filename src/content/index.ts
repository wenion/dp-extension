import { registerMessageListener } from "./message/listerner";
import { initialize } from "./message/BackgroundClient";
import { overlay } from "./overlay/overlay";
import { CaptureManager } from "./capture";
import { captureContext } from "./capture/context";

import type { InitState } from "@/shared/types";

const capture = new CaptureManager();


init().catch(console.error);
async function init() {
  registerMessageListener(capture);

  const state = await initialize() as InitState;
  state.mounted ? overlay.show(state) : overlay.hide();

  captureContext.initialize({...state});

  const tab = captureContext.getTab();
  if (!tab) {
    return;
  }
  capture.ensureRecording(tab, state.activeSession);
}
