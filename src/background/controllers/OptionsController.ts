import { env } from "@/config/env";

import type { ExtensionService } from "../services/ExtensionService";
import type { SessionsService } from "../services/SessionsService";
import type { TabsService } from "../services/TabsService";

import type {
  OptionsEvent,
} from "@/shared/messaging/optionsProtocol";

export class OptionsController {

  private extensionService: ExtensionService;
  private sessionsService: SessionsService;
  private tabsService: TabsService;

  constructor(
    extensionService: ExtensionService,
    sessionsService: SessionsService,
    tabsService: TabsService,
  ) {
    this.extensionService = extensionService;
    this.sessionsService = sessionsService;
    this.tabsService = tabsService;
  }

  async handleOptionsEvent(
    event: OptionsEvent,
  ): Promise<void> {
    switch (event.type) {
      case "OPTIONS/ALLOWLIST_ADD":
        await this.tabsService.addToAllowlist(
          event.payload.origin,
        );
        return;

      case "OPTIONS/ALLOWLIST_REMOVE":
        await this.tabsService.removeFromAllowlist(
          event.payload.origin,
        );
        return;

      case "OPTIONS/SET_PAGE":
        await this.extensionService.setOptionsPage(
          event.payload.page,
        );
        return;

      case "OPTIONS/RENAME_SESSION":
        await this.sessionsService.updateSession(
          event.payload.sessionId,
          {
            name: event.payload.name,
          },
        );
        return;

      case "OPTIONS/OPEN_SESSION":
        await this.openSession(
          event.payload.sessionId,
        )
        return;
    }
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
