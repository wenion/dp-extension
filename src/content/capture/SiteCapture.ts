import { getPlatformName } from "./platform";
import { initializeSite } from "./registry";

import type { Overlay } from "../overlay/Overlay";
import type { Platform } from "./platform";
import type { Dispose } from "./types";

export class SiteCapture {
  private platform?: Platform;
  private dispose?: Dispose;

  start(
    url: string,
    overlay?: Overlay,
  ): boolean {
    if (this.dispose) {
      return false;
    }

    this.platform = getPlatformName(url);

    this.dispose = initializeSite(
      this.platform,
      overlay,
    );

    return true;
  }

  stop(): boolean {
    if (!this.dispose) {
      return false;
    }

    this.dispose();

    this.dispose = undefined;
    this.platform = undefined;

    return true;
  }
}
