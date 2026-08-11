import type { ActiveSession } from "@/shared/types";

export class ActiveSessionRepository {
  private activeSession?: ActiveSession;

  async initialize(): Promise<void> {
    const { activeSession } =
      await chrome.storage.local.get<{
        activeSession?: ActiveSession;
      }>("activeSession");

    this.activeSession = activeSession;
  }

  async setActiveSession(
    activeSession: ActiveSession,
  ): Promise<ActiveSession> {
    this.activeSession = activeSession;

    await chrome.storage.local.set({
      activeSession,
    });

    return activeSession;
  }

  async clearActiveSession(): Promise<void> {
    this.activeSession = undefined;

    await chrome.storage.local.remove("activeSession");
  }

  getActiveSession(): ActiveSession | undefined{
    return this.activeSession;
  }
}
