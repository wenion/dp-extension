import { sendUserTrace } from "../../message/backgroundClient";

import {
  copilotMutationHandler,
  createCopilotMutationListener,
} from "../handlers/mutation/copilot";

import { ListenerGroup } from "../listener/ListenerGroup";
import { observe } from "../listener/observe";
import { mountCommonListeners } from "./common";

import type { Overlay } from "../../overlay/Overlay";
import type { Dispose } from "../types";

const copilotMutationConfig: MutationObserverInit = {
  childList: true, // Watch for addition or removal of child nodes
  // attributes: true, // Watch for changes to attributes
  subtree: true,   // Watch for changes in descendant nodes
  characterData: true, // Text content changed
};

export const copilotPlatform = {
  mount(
    overlay?: Overlay,
  ): Dispose {
    const group = new ListenerGroup();

    // common listeners
    group.add(
      mountCommonListeners(overlay),
    );

    // copilot mutation
    group.add(
      observe(
        document.body,
        copilotMutationConfig,
        createCopilotMutationListener(
          async node => {
            try {
              await sendUserTrace(
                copilotMutationHandler(node),
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

    console.log("start trace")

    return () => group.dispose();
  },
};