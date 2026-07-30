import { env } from "@/config/env";

import type { AuthenticationService } from "../services/AuthenticationService";
import type { NotificationService } from "../services/NotificationService";
import type { PageService } from "../services/PageService";
import type { SessionsService } from "../services/SessionsService";
import type { TabService } from "../services/TabService";

import type {
  OptionsState,
  Session,
} from "@/shared/types";

export class OptionsController {

  private authService: AuthenticationService;
  private pageService: PageService;
  private sessionsService: SessionsService;
  private tabService: TabService;
  private notificationService: NotificationService;

  constructor(
    authService: AuthenticationService,
    pageService: PageService,
    sessionsService: SessionsService,
    tabService: TabService,
    notificationService: NotificationService,
  ) {
    this.authService = authService;
    this.pageService = pageService;
    this.sessionsService = sessionsService;
    this.tabService = tabService;
    this.notificationService = notificationService;
  }

  /**
   * Sends the initial state to the options page after it connects.
   */
  async onOptionsConnected(): Promise<void> {
    const state: OptionsState = {
      ...this.pageService.getState(),
      tabs: this.tabService.getTabs(),
      sessions: this.sessionsService.getSessions(),
      currentNotification:
        this.notificationService.getCurrentNotification(),
      notifications:
        this.notificationService.getNotifications(),
    }

    await this.pageService.onOptionsConnected(state);
  }

  /**
   * Mounts the page UI.
   *
   * If the user is not authenticated, starts the login flow instead.
   */
  async mount(): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      await this.authService.openLogin();
      return;
    }

    await this.pageService.onMounted();
  }

  async rename(
    sessionId: string,
    name: string,
  ): Promise<Session> {
    return await this.sessionsService.renameSession(
      sessionId,
      name,
    );
  }

  /**
   * Opens a session in a new browser tab.
   */
  async openSession(
    sessionId: string,
  ): Promise<void> {
    const url = new URL(env.apiUrl);

    url.pathname = "/session";
    url.searchParams.set(
      "clientId",
      sessionId,
    );

    await chrome.tabs.create({
      url: url.toString()
    });
  }
}
