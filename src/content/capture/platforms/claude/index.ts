import { sendUserTrace } from "../../../message/backgroundClient";

import { ListenerGroup } from "../../listener/ListenerGroup";
import { mountCommonListeners } from "../common";
import { mountClaudeFetch } from "./fetch";

import type { Overlay } from "../../../overlay/Overlay";
import type { Dispose } from "../../types";

export const claudePlatform = {
  mount(
    overlay?: Overlay,
  ): Dispose {
    const group = new ListenerGroup();

    group.add(
      mountCommonListeners(overlay),
    );

    group.add(
      mountClaudeFetch(sendUserTrace),
    );

    return () => group.dispose();
  },
};
