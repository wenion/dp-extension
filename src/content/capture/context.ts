import type { TabState, Session } from "@/shared/types";

class ContentContext {
  private tabId?: number;
  private tabs?: readonly TabState[];
  private activeSession?: Session;

  initialize({
    tabId,
    activeSession,
    tabs,
  }: {
    tabId: number;
    activeSession?: Session;
    tabs: readonly TabState[];
  }) {
    this.tabId = tabId;
    this.activeSession = activeSession;
    this.tabs = tabs;
  }

  getTab(): TabState | undefined {
    return this.tabs?.find(
      tab => tab.tabId === this.tabId
    );
  }

  getActiveSession(): Session | undefined {
    return this.activeSession;
  }

  setActiveSession(activeSession?: Session) {
    this.activeSession = activeSession;
  }

  setTabs(tabs: readonly TabState[]) {
    this.tabs = tabs;
  }
}

export const captureContext =
  new ContentContext();
