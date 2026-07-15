import {
  geminiMutationHandler,
  createGeminiMutationListener,
} from "../handlers/mutation/gemini";
import { ListenerGroup } from "../listener/ListenerGroup";
import { observe } from "../listener/observe";
import { sendUserTrace } from "../sender";
import { mountCommonListeners } from "./common";

import type { Dispose } from "../types";


const geminiMutationConfig = {
  childList: true,
  attributes: true,
  attributeFilter: ["id"],
  subtree: true,
  characterData: true,
};

export const geminiPlatform = {
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
        geminiMutationConfig,
        createGeminiMutationListener(
          node => sendUserTrace(geminiMutationHandler(node))
        )
      )
    );

    return () => group.dispose();

  }
};