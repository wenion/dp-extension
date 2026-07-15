import type { Storage } from "../storage/Storage";

import type { ContentScriptService } from "./ContentScriptService";
import type { SessionService } from "./SessionService";
import type { PageService } from "./PageService";

export class ActionService {
  private readonly storage: Storage;
  private readonly contentScriptService: ContentScriptService;
  private readonly pageService: PageService;
  private readonly sessionService: SessionService;

  constructor(
    storage: Storage,
    contentScriptService: ContentScriptService,
    pageService: PageService,
    sessionService: SessionService,
  ) {
    this.storage = storage;
    this.contentScriptService = contentScriptService;
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
      await this.contentScriptService.unmount();
    } else {
      await this.contentScriptService.mount(tabId);
    }
  }
}
