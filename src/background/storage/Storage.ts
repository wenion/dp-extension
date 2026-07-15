import type {
  Profile,
  Session,
  PageState,
  TabState
} from "@/shared/types";

export class Storage {
  private token?: string;
  private profile?: Profile;
  private activeSession?: Session;
  private pageState?: PageState;
  private pageMounted?: boolean;
  private tabs = new Map<number, TabState>();
  private sessions = new Map<string, Session>();

  async init() {
    const {
      token,
      profile,
      activeSession,
      pageState,
      pageMounted,
      tabs,
      sessions,
    } = await chrome.storage.local.get([
      "token",
      "profile",
      "activeSession",
      "pageState",
      "pageMounted",
      "tabs",
      "sessions"
    ]);
    this.token = token as string | undefined;
    this.profile = profile as Profile | undefined;
    this.activeSession = activeSession as Session | undefined;
    this.pageState = pageState as PageState | undefined;
    this.pageMounted = pageMounted as boolean | undefined;

    this.tabs = new Map(
      ((tabs ?? []) as TabState[]).map(tab => [tab.tabId, tab])
    );

    this.sessions = new Map(
      ((sessions ?? []) as Session[]).map(session => [
        session.clientId,
        session,
      ])
    );
  }

  getToken() {
    return this.token;
  }

  async setToken(token: string) {
    this.token = token;
    await chrome.storage.local.set({ token });
  }

  getProfile() {
    return this.profile;
  }

  async setProfile(profile: Profile) {
    this.profile = profile;
    await chrome.storage.local.set({ profile });
  }

  getActiveSession() {
    return this.activeSession;
  }

  async setActiveSession(activeSession: Session) {
    this.activeSession = activeSession;
    await chrome.storage.local.set({ activeSession });
  }

  async clearActiveSession() {
    this.activeSession = undefined;
    await chrome.storage.local.remove("activeSession");
  }

  getPageState() {
    return this.pageState;
  }

  async setPageState(pageState: PageState) {
    this.pageState = pageState;
    await chrome.storage.local.set({ pageState });
  }

  getPageMounted() {
    return this.pageMounted;
  }

  async setPageMounted(pageMounted: boolean) {
    this.pageMounted = pageMounted;
    await chrome.storage.local.set({ pageMounted });
  }

  getTab(tabId:number) {
    return this.tabs.get(tabId);
  }

  getTabs(): readonly TabState[] {
    return [...this.tabs.values()];
  }

  async setTab(tab:TabState) {
    this.tabs.set(tab.tabId, tab);

    await chrome.storage.local.set({
        tabs: [...this.tabs.values()]
    });
  }

  async setTabs(tabs: readonly TabState[]) {
    this.tabs = new Map(
      tabs.map(tab => [tab.tabId, tab])
    );

    await chrome.storage.local.set({
      tabs,
    });
  }

  async removeTab(tabId:number) {
    this.tabs.delete(tabId);

    await chrome.storage.local.set({
        tabs: [...this.tabs.values()]
    });
  }

  hasTab(tabId:number) {
    return this.tabs.has(tabId);
  }

  getSessionById(id: string) {
    return this.sessions.get(id);
  }

  getSessions(): readonly Session[] {
    return [...this.sessions.values()]
      .sort((a, b) => b.startedAt - a.startedAt);
  }

  async setSessions(sessions: readonly Session[]) {
    this.sessions = new Map(
      sessions.map(session => [session.clientId, session])
    );

    await chrome.storage.local.set({
      sessions,
    });
  }

  async appendSession(session: Session) {
    this.sessions.set(session.clientId, session);

    await chrome.storage.local.set({
      sessions: [...this.sessions.values()],
    });
  }

  async updateSession(
    id: string,
    patch: Partial<Session>,
  ) {
    const session = this.sessions.get(id);

    if (!session) {
      return;
    }

    this.sessions.set(id, {
      ...session,
      ...patch,
    });

    await chrome.storage.local.set({
      sessions: [...this.sessions.values()],
    });
  }

  async removeSession(id: string) {
    this.sessions.delete(id);

    await chrome.storage.local.set({
      sessions: [...this.sessions.values()],
    });
  }

}