import { Storage } from "../storage/Storage";

import type { AppState, PageState, Session } from "@/shared/types";


export class StorageService {
  private readonly storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  // async initialize() {
  //   await this.storage.setPageState("idle");
  //   await this.storage.setPageMounted(false);
  // }

  private normalizePageState(
    pageState?: PageState,
    activeSession?: Session,
  ): PageState {
    if (!activeSession) {
      switch(pageState) {
        case "uploadFailed":
        case "idle":
          return pageState;
        default:
          return "idle"
      }
    }

    if (!pageState || pageState === "idle") {
      return "expanded";
    }

    return pageState;
  }

  private normalizePageMounted(
    pageMounted?: boolean,
    activeSession?: Session,
  ): boolean {
    if (activeSession) {
      return true;
    }

    return pageMounted ?? false;
  }

  private async repairState() {
    const pageState = this.storage.getPageState();
    const activeSession = this.storage.getActiveSession();
    const pageMounted = this.storage.getPageMounted();

    const normalizedPageState =
      this.normalizePageState(pageState, activeSession);
    if (normalizedPageState !== pageState) {
      await this.storage.setPageState(normalizedPageState);
    }

    const normalizedPageMounted =
      this.normalizePageMounted(pageMounted, activeSession);
    if (normalizedPageMounted !== pageMounted) {
      await this.storage.setPageMounted(normalizedPageMounted);
    }
  }

  async getNormalizedAppState(): Promise<AppState> {
    await this.repairState();

    return {
      pageState: this.storage.getPageState() as PageState,
      mounted: this.storage.getPageMounted() as boolean,
      activeSession: this.storage.getActiveSession(),
      tabs: this.storage.getTabs(),
      sessions: this.storage.getSessions(),
    }
  }
}