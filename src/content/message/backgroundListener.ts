import type { ContentController } from "../ContentController";

import type {
  BackgroundEvent,
} from "@/shared/messaging/backgroundProtocol";


export function startBackgroundListener(
  contentController: ContentController,
): void {
  chrome.runtime.onMessage.addListener(
    async (msg: BackgroundEvent) => {
      switch (msg.type) {
        case "CONTENT/INITIALIZED":
          await contentController.initializeStore(
            msg.payload
          );
          return;

        case "MOUNT/UPDATED":
          contentController.setMount(msg.payload.mounted);
          return;

        case "SESSION/UPDATED":
          contentController.setActiveSession(msg.payload);
          return;

        case "TABS/UPDATED":
          contentController.setTabs(msg.payload);
          return;

        case "PING":
          return;
      }
    },
  );
}
