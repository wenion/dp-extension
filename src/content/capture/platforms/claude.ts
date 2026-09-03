import { sendUserTrace } from "../../message/backgroundClient";

import {
  claudeMutationHandler,
  createClaudeMutationListener,
} from "../handlers/mutation/claude";
import { ListenerGroup } from "../listener/ListenerGroup";
import { observe } from "../listener/observe";
import { mountCommonListeners } from "./common";

import type { Overlay } from "../../overlay/Overlay";
import type { Dispose } from "../types";

const claudeMutationConfig: MutationObserverInit = {
  childList: true,
  attributes: true,
  subtree: true,
  characterData: true,
};

export const claudePlatform = {
  mount(
    overlay?: Overlay,
  ): Dispose {
    const group = new ListenerGroup();

    group.add(
      mountCommonListeners(overlay),
    );

    group.add(
      observe(
        document.body,
        claudeMutationConfig,
        createClaudeMutationListener(
          async node => {
            try {
              await sendUserTrace(
                claudeMutationHandler(node),
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