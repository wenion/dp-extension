import {
  captureStarted,
  captureStopped,
} from "./message/backgroundClient";

import type { ContentStore } from "./ContentState";
import type { SiteCapture } from "./capture/SiteCapture";
import type { Overlay } from "./overlay/Overlay";

import type {
  ContentState,
  Session,
  TabState,
} from "@/shared/types";


export class ContentController {
  private store: ContentStore;
  private overlay: Overlay;
  private siteCapture: SiteCapture;

  constructor(
    store: ContentStore,
    overlay: Overlay,
    siteCapture: SiteCapture,
  ) {
    this.store = store;
    this.overlay = overlay;
    this.siteCapture = siteCapture;
  }

  async initializeStore(
    state: ContentState,
  ): Promise<void> {
    this.store.initialize(state);

    this.updateOverlay();
    await this.updateCapture();
  }

  setMount(
    mounted: boolean,
  ): void {
    this.store.setMount(mounted);

    this.updateOverlay();
  }

  async setActiveSession(
    session?: Session,
  ): Promise<void> {
    this.store.setActiveSession(session);

    await this.updateCapture();
  }

  async setTabs(
    tabs: readonly TabState[],
  ): Promise<void> {
    this.store.setTabs(tabs);

    await this.updateCapture();
  }

  showError(error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    this.overlay.show({
      notice: message,
    });
  }

  private updateOverlay(): void {
    this.store.isMounted()
      ? this.overlay.show(this.store.getState())
      : this.overlay.hide();
  }

  private async updateCapture(): Promise<void> {
    const session =
      this.store.getActiveSession();

    const tab =
      this.store.getTab();

    if (
      session &&
      tab?.recordingScope === "recording"
    ) {
      if (this.siteCapture.start(tab.url)) {
        try {
          await captureStarted();
        } catch (error) {
          this.showError(error);
        }
      }

      return;
    }

    if (this.siteCapture.stop()) {
      try {
        await captureStopped();
      } catch (error) {
        this.showError(error);
      }
    }
  }
}
