import type { ContentController } from "../ContentController";

import type { BackgroundEvent } from "@/shared/message/backgroundEvents";

export function registerMessageListener(
  controller: ContentController,
) {
  chrome.runtime.onMessage.addListener(
    (msg: BackgroundEvent, _sender, sendResponse) => {
      controller.handleEvent(msg, sendResponse);
    }
  );
}
