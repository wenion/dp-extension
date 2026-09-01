import type {
  ContentState,
  Session,
  TabState,
} from "@/shared/types";

import type { ContentStoreState } from "./types";

export class ContentStore {
  private mount?: boolean;
  private activeSession?: Session;
  private tabs?: readonly TabState[];
  private tabId?: number;

  initialize(state: ContentState) {
    this.mount = state.mount;
    this.activeSession = state.activeSession;
    this.tabs = state.tabs;
    this.tabId = state.tabId;
  }

  getState(): ContentStoreState {
    return {
      mount: this.mount,
      activeSession: this.activeSession,
      tabs: this.tabs,
      tabId: this.tabId,
    };
  }

  isMounted(): boolean | undefined {
    return this.mount;
  }

  getActiveSession(): Session | undefined {
    return this.activeSession;
  }

  getTabs(): readonly TabState[] | undefined {
    return this.tabs;
  }

  getTab(): TabState | undefined {
    return this.tabs?.find(
      tab => tab.tabId === this.tabId,
    );
  }

  getTabId(): number | undefined {
    return this.tabId;
  }

  setMount(mount: boolean) {
    this.mount = mount;
  }

  setActiveSession(
    session?: Session,
  ) {
    this.activeSession = session;
  }

  setTabs(
    tabs: readonly TabState[],
  ) {
    this.tabs = tabs;
  }
}
