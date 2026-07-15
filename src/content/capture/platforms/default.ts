// platforms/defaultPlatform.ts

import { mountCommonListeners } from "./common";
import type { Dispose } from "../types";

export const defaultPlatform = {
  mount(): Dispose {
    return mountCommonListeners();
  },
};