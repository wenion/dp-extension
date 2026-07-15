import {
  chatgptMutationHandler,
  createChatGPTMutationListener,
} from "../handlers/mutation/chatgpt";
import { ListenerGroup } from "../listener/ListenerGroup";
import { observe } from "../listener/observe";
import { sendUserTrace } from "../sender";
import { mountCommonListeners } from "./common";

import type { Dispose } from "../types";


const chatgptMutationConfig = {
  childList: true, // Watch for addition or removal of child nodes
  // attributes: true, // Watch for changes to attributes
  subtree: true,   // Watch for changes in descendant nodes
  characterData: true, // Text content changed
};

export const chatgptPlatform = {
  mount(): Dispose {
    const group = new ListenerGroup();

    // common listeners
    group.add(
      mountCommonListeners()
    );

    // chatgpt mutation
    group.add(
      observe(
        document.body,
        chatgptMutationConfig,
        createChatGPTMutationListener(
          node => sendUserTrace(chatgptMutationHandler(node))
        )
      )
    );

    return () => group.dispose();

  }
};