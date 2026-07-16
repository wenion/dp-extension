import type { Storage } from "../storage/Storage";

import type { StorageService } from "./StorageService";
import type { SessionService } from "./SessionService";
import type { PageService } from "./PageService";

export class ActionService {
  private readonly storage: Storage;
  private readonly storageService: StorageService;
  private readonly pageService: PageService;
  private readonly sessionService: SessionService;

  constructor(
    storage: Storage,
    storageService: StorageService,
    pageService: PageService,
    sessionService: SessionService,
  ) {
    this.storage = storage;
    this.storageService = storageService;
    this.sessionService = sessionService;
    this.pageService = pageService;
  }

  async toggle(tabId: number) {
    const mounted = this.storage.getPageMounted();
    const session = this.sessionService.getActiveSession();

    if (mounted && session) {
      await this.pageService.showExitConfirmation();
      return;
    }

    if (mounted) {
      await this.pageService.unmount();
    } else {
      await this.pageService.mount(tabId);
    }
  }
}
