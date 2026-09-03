import { sendUserTrace } from "../../message/backgroundClient";

import {
  chatgptMutationHandler,
  createChatGPTMutationListener,
} from "../handlers/mutation/chatgpt";
import { ListenerGroup } from "../listener/ListenerGroup";
import { observe } from "../listener/observe";
import { mountCommonListeners } from "./common";

import type { Overlay } from "../../overlay/Overlay";
import type { Dispose } from "../types";

const chatgptMutationConfig: MutationObserverInit = {
  childList: true, // Watch for addition or removal of child nodes
  // attributes: true, // Watch for changes to attributes
  subtree: true,   // Watch for changes in descendant nodes
  characterData: true, // Text content changed
};

export const chatgptPlatform = {
  mount(
    overlay?: Overlay,
  ): Dispose {
    const group = new ListenerGroup();

    // common listeners
    group.add(
      mountCommonListeners(overlay),
    );

    // chatgpt mutation
    group.add(
      observe(
        document.body,
        chatgptMutationConfig,
        createChatGPTMutationListener(
          async node => {
            try {
              await sendUserTrace(
                chatgptMutationHandler(node),
              );
            } catch (error) {
              if (!(error instanceof Error)) {
                throw error;
              }

              overlay?.show({
                notice: `${error.message} Please reload the page.`,
              });
            }
          },
        ),
      ),
    );

    return () => group.dispose();
  },
};