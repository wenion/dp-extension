// platforms/defaultPlatform.ts

import { mountCommonListeners } from "./common";

import type { Overlay } from "../../overlay/Overlay";
import type { Dispose } from "../types";

export const defaultPlatform = {
  mount(
    overlay?: Overlay,
  ): Dispose {
    return mountCommonListeners(overlay);
  },
};