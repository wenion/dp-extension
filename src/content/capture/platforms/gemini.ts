import { sendUserTrace } from "../../message/backgroundClient";

import {
  geminiMutationHandler,
  createGeminiMutationListener,
} from "../handlers/mutation/gemini";
import { ListenerGroup } from "../listener/ListenerGroup";
import { observe } from "../listener/observe";
import { mountCommonListeners } from "./common";

import type { Overlay } from "../../overlay/Overlay";
import type { Dispose } from "../types";


const geminiMutationConfig: MutationObserverInit = {
  childList: true,
  attributes: true,
  attributeFilter: ["id"],
  subtree: true,
  characterData: true,
};

export const geminiPlatform = {
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
        geminiMutationConfig,
        createGeminiMutationListener(
          async node => {
            try {
              await sendUserTrace(
                geminiMutationHandler(node),
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