import { initializeSite } from "./registry";
import { getPlatform } from "./platform";

import type { Dispose } from "./types";
import type { Platform } from "./platform";

export class SiteCapture {
  private platform?: Platform;
  private dispose?: Dispose;

  start(url: string): boolean {
    if (this.dispose) {
      return false;
    }

    this.platform = getPlatform(url);

    this.dispose =
      initializeSite(this.platform);

    return true;
  }

  stop(): boolean {
    if (!this.dispose) {
      return false;
    }

    this.dispose?.();

    this.dispose = undefined;
    this.platform = undefined;

    return true;
  }
}
