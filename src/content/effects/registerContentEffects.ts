import { 
  captureStarted,
  captureStopped,
} from "../message/BackgroundClient";

import { ContentStore } from "../ContentState";
import { overlay } from "../overlay/overlay";

import type { SiteCapture } from "../capture";

export function registerContentEffects(
  store: ContentStore,
  siteCapture: SiteCapture,
) {
  const unsubscribeMount = store.subscribe(
    store => store.isMounted(),
    mounted => {
      mounted
        ? overlay.show(store.getAll())
        : overlay.hide();
    },
  );

  const unsubscribeCapture = store.subscribe(
    store => {
      const session = store.getActiveSession();
      const tab = store.getTab();

      return session &&
        tab?.recordingScope === "recording"
          ? `recording:${tab.url}`
          : "stopped";
    },
    state => {
      if (state === "stopped") {
        siteCapture.stop();

        captureStopped();
        return;
      }

      const tab = store.getTab();

      if (tab) {
        siteCapture.start(tab.url);

        captureStarted();
      }
    },
  );

  return () => {
    unsubscribeMount();
    unsubscribeCapture();
  };
}
