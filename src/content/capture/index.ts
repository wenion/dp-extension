import { initializeSite } from "./registry";
import { getPlatform } from "./platform";

import type { TabState, Session } from "@/shared/types";
import type { Dispose } from "./types";
import type { Platform } from "./platform";

export class CaptureManager {
  private platform?: Platform;
  private dispose?: Dispose;

  ensureRecording(tab: TabState, activeSession?: Session) {
    const url = tab.url;
    // current session
    const enabled =
      tab.recordingStatus === "recording" && activeSession;

    if (!enabled) {
      if (!this.dispose) {
        return;
      }

      this.dispose();
      this.dispose = undefined;
      this.platform = undefined;
      return;
    }

    const platform = getPlatform(url);


    if (this.dispose && this.platform === platform) {
      return;
    }


    this.dispose?.();

    this.dispose = initializeSite(platform);
    this.platform = platform;
  }
}
