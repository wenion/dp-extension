import {
  claudeMutationHandler,
  createClaudeMutationListener,
} from "../handlers/mutation/claude";
import { ListenerGroup } from "../listener/ListenerGroup";
import { observe } from "../listener/observe";
import { sendUserTrace } from "../sender";
import { mountCommonListeners } from "./common";

import type { Dispose } from "../types";


const claudeMutationConfig = {
  childList: true,
  attributes: true,
  subtree: true,
  characterData: true,
};

export const claudePlatform = {
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
        claudeMutationConfig,
        createClaudeMutationListener(
          node => sendUserTrace(claudeMutationHandler(node))
        )
      )
    );

    return () => group.dispose();

  }
};