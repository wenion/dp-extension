import { initializeSite } from "./registry";
import { getPlatform } from "./platform";

import type { Dispose } from "./types";
import type { Platform } from "./platform";

export class CaptureManager {
  private platform?: Platform;
  private dispose?: Dispose;

  mount(
    url: string
  ) {
    if (this.dispose) {
      return;
    }

    this.platform = getPlatform(url);
    this.dispose = initializeSite(this.platform);
  }

  unmount() {
    this.dispose?.();
    this.dispose = undefined;
    this.platform = undefined;
  }
}
