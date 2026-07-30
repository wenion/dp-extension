import type {
  PageState,
  Session,
} from "@/shared/types";

export class StateRepository {
  private activeSession?: Session;
  private pageMounted?: boolean;
  private pageState?: PageState;

  async initialize() {
    const {
      activeSession,
      pageState,
      pageMounted,
    } = await chrome.storage.local.get([
      "activeSession",
      "pageState",
      "pageMounted",
    ]);

    this.activeSession = activeSession as Session | undefined;
    this.pageMounted = pageMounted as boolean | undefined;
    this.pageState = pageState as PageState | undefined;
  }

  getActiveSession(): Session | undefined {
    return this.activeSession;
  }

  async setActiveSession(session: Session) {
    this.activeSession = session;

    await chrome.storage.local.set({
      "activeSession": session,
    });
  }

  async clearActiveSession() {
    this.activeSession = undefined;

    await chrome.storage.local.remove("activeSession");
  }

  getPageState(): PageState {
    return this.pageState ?? "idle";
  }

  async setPageState(pageState: PageState) {
    this.pageState = pageState;

    await chrome.storage.local.set({
      pageState,
    });
  }

  async clearPageState() {
    this.pageState = undefined;

    await chrome.storage.local.remove("pageState");
  }

  getPageMounted(): boolean | undefined {
    return this.pageMounted;
  }

  async setPageMounted(mounted: boolean) {
    this.pageMounted = mounted;

    await chrome.storage.local.set({
      "pageMounted": mounted,
    });
  }

  async clearPageMounted() {
    this.pageMounted = undefined;

    await chrome.storage.local.remove("pageMounted");
  }

  getState() {
    return {
      activeSession: this.activeSession,
      pageState: this.pageState,
      pageMounted: this.pageMounted,
    };
  }

  async clear() {
    this.activeSession = undefined;
    this.pageState = undefined;
    this.pageMounted = undefined;

    await chrome.storage.local.remove([
      "activeSession",
      "pageState",
      "pageMounted",
    ]);
  }
}