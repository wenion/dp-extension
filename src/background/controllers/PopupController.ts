import type { AuthenticationService } from "../services/AuthenticationService";
import type { ContentScriptService } from "../services/ContentScriptService";
import type { PageService } from "../services/PageService";
import type { SessionService } from "../services/SessionService";
import type { TabService } from "../services/TabService";

import { InjectionResult } from "@/shared/content-script";
import type { ContentState } from "@/shared/types";

export class PopupController {

  private authService: AuthenticationService;
  private pageService: PageService;
  private sessionService: SessionService;
  private tabService: TabService;
  private contentScriptService: ContentScriptService;

  constructor(
    authService: AuthenticationService,
    pageService: PageService,
    sessionService: SessionService,
    tabService: TabService,
    contentScriptService: ContentScriptService,
  ) {
    this.authService = authService;
    this.pageService = pageService;
    this.sessionService = sessionService;
    this.tabService = tabService;
    this.contentScriptService = contentScriptService;
  }

  /**
   * Returns the current popup state.
   */
  initialize(tabId: number): ContentState {
    return {
      ...this.pageService.getState(),
      tabs: this.tabService.getTabs(),
      tabId,
    };
  }

  /**
   * Handles clicks on the extension action button.
   */
  async handleActionClick(tabId: number): Promise<InjectionResult> {
    if (!this.authService.isAuthenticated()) {
      await this.authService.openLogin();
      return InjectionResult.NotAuthenticated;
    }

    const result =
      await this.contentScriptService.inject(tabId);

    if (result !== InjectionResult.Success) {
      await this.tabService.setDisconnected(tabId);
    }

    const mounted = this.pageService.getPageMounted();
    const session = this.sessionService.getActiveSession();

    if (mounted && session) {
      await this.pageService.onExitRequested();
      return result;
    }

    if (mounted) {
      await this.pageService.onUnmounted();
      return result;
    }

    await this.pageService.onMounted();
    return result;
  }
}
