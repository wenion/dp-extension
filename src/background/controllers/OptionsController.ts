import { env } from "@/config/env";

import type { SessionsService } from "../services/SessionsService";

import type {
  Session,
} from "@/shared/types";

export class OptionsController {

  private sessionsService: SessionsService;

  constructor(
    sessionsService: SessionsService,
  ) {
    this.sessionsService = sessionsService;
  }

  async rename(
    sessionId: string,
    name: string,
  ): Promise<Session | undefined> {
    try {
      return this.sessionsService.renameSession(
        sessionId,
        name,
      );
    } catch {
      return undefined;
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
