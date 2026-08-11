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

  const unsubscribeSession = store.subscribe(
    store => store.getActiveSession(),
    (session, previousSession) => {
      if (!previousSession && session && store.getTab()?.recordingScope === "recording") {
        const tab = store.getTab();
        if (tab) {
          siteCapture.start(tab.url);
          return;
        }
      }

      if (previousSession && !session && store.getTab()?.recordingScope === "recording") {
        siteCapture.stop();
        return;
      }
    },
  );

  const unsubscribeTab = store.subscribe(
    store => store.getTab()?.recordingScope,
    (recordingScope, previousRecordingScope) => {
      if (!store.getActiveSession()) {
        return;
      }
      
      if (
        previousRecordingScope !== "recording" &&
        recordingScope === "recording"
      ) {
        const tab = store.getTab();

        if (tab) {
          siteCapture.start(tab.url);
        }

        return;
      }

      if (
        previousRecordingScope === "recording" &&
        recordingScope !== "recording"
      ) {
        siteCapture.stop();
      }
    },
  );

  return () => {
    unsubscribeMount();
    unsubscribeSession();
    unsubscribeTab();
  };
}