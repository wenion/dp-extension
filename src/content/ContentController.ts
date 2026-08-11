import { ContentStore } from "./ContentState";

import type { ContentState } from "@/shared/types";
import type { BackgroundEvent } from "@/shared/message/backgroundEvents";

export class ContentController {
  private store: ContentStore;
  constructor(
    store: ContentStore,
  ) {
    this.store = store;
  }

  handleEvent(
    msg: BackgroundEvent,
    sendResponse: (res?: unknown) => void,
  ) {
    switch (msg.type) {
      case "CONTENT/INITIALIZED":
        this.store.initialize(msg.payload);
        break;

      case "MOUNT/UPDATED":
        this.store.setMount(msg.payload.mounted);
        break;

      case "SESSION/UPDATED":
        this.store.setActiveSession(msg.payload);
        break;

      case "TABS/UPDATED":
        this.store.setTabs(msg.payload);
        break;

      case "PING":
        sendResponse({
          injected: true,
        });
        break;
    }
  }

  handleInitialized(state: ContentState) {
    this.store.initialize(state);
  }
}
