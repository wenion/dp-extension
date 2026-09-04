import { env } from "@/config/env";

import type { ActiveSessionService } from "../services/ActiveSessionService";
import type { AuthenticationService } from "../services/AuthenticationService";
import type { BadgeService } from "../services/BadgeService";
import type { ContentScriptService } from "../services/ContentScriptService";
import type { ExtensionService } from "../services/ExtensionService";
import type { GoogleDocsService } from "../services/GoogleDocsService";
import type { NotificationService } from "../services/NotificationService";
import type { SessionsService } from "../services/SessionsService";
import type { TabsService } from "../services/TabsService";
import type { TraceService } from "../services/TraceService";
import type { TraceProcessorService } from "../services/TraceProcessorService";

import { MissingAccessTokenError } from "../network/errors/MissingAccessTokenError";
import { NotificationDefinitions } from "../services/NotificationService/NotificationDefinitions";

import type {
  ActiveSession,
  ContentState,
  OptionsState,
} from "@/shared/types";

const SIGN_IN_MENU_ID = "sign-in";

const DEFAULT_ORIGINS = [
  "https://docs.google.com",
  "https://chatgpt.com",
  "https://claude.ai",
  "https://gemini.google.com",
  "https://www.overleaf.com",
] as const;

export class ExtensionController {
  private activeSessionService: ActiveSessionService;
  private authService: AuthenticationService;
  private badgeService: BadgeService;
  private contentScriptService: ContentScriptService;
  private extensionService: ExtensionService;
  private googleDocsService: GoogleDocsService;
  private notificationService: NotificationService;
  private sessionsService: SessionsService;
  private tabsService: TabsService;
  private traceService: TraceService;
  private traceProcessorService: TraceProcessorService;

  constructor(
    activeSessionService: ActiveSessionService,
    authService: AuthenticationService,
    badgeService: BadgeService,
    contentScriptService: ContentScriptService,
    extensionService: ExtensionService,
    googleDocsService: GoogleDocsService,
    notificationService: NotificationService,
    sessionsService: SessionsService,
    tabsService: TabsService,
    traceService: TraceService,
    traceProcessorService: TraceProcessorService,
  ) {
    this.activeSessionService = activeSessionService;
    this.authService = authService;
    this.badgeService = badgeService;
    this.contentScriptService = contentScriptService;
    this.extensionService = extensionService;
    this.googleDocsService = googleDocsService;
    this.notificationService = notificationService;
    this.sessionsService = sessionsService;
    this.tabsService = tabsService;
    this.traceService = traceService;
    this.traceProcessorService = traceProcessorService;
  }

  /**
   * Restores extension state when the background service worker starts.
   *
   * Removes stale tabs, restores content-script connections,
   * synchronizes remote sessions, and updates the extension badge.
   */
  async onBackgroundStartup() {
    // Restore tabs from storage.
    await this.restoreTabs();

    // Sync remote sessions.
    try {
      await this.sessionsService.fetchSessions();

    } catch (error) {
      if (error instanceof MissingAccessTokenError) {
        await this.badgeService.setUnauthenticated();
        return;
      }

      throw error;
    }

    // Sync connected content scripts.
    const connectedTabs =
      this.tabsService
        .getTabs()
        .filter(tab => tab.connected);

    await Promise.allSettled(
      connectedTabs.map(async tab => {
        const contentState =
          this.getContentState(
            tab.tabId,
          );

        await this.extensionService.notifyContent(
          tab.tabId,
          contentState,
        );
      }),
    );

    // Restore badge state.
    await this.updateCurrentBadge();
  }

  getContentState(
    tabId: number,
  ): ContentState {
    return {
      mount: this.extensionService.isMountEnabled(),
      activeSession: this.activeSessionService.getActiveSession(),
      tabs: this.tabsService.getTabs(),
      tabId,
    }
  }

  getOptionsState(): OptionsState {
    return {
      mount: this.extensionService.isMountEnabled(),
      activeSession: this.activeSessionService.getActiveSession(),
      tabs: this.tabsService.getTabs(),
      sessions: this.sessionsService.getSessions(),
      currentNotification: this.notificationService.getCurrentNotification(),
      notifications: this.notificationService.getNotifications(),

      page: this.extensionService.getOptionsPage(),
      allowlist: this.tabsService.getAllowlist(),
    }
  }

  private async mount() {
    await this.extensionService.mount();

    await this.updateCurrentBadge();
  }

  private async unmount() {
    const activeSession =
      this.activeSessionService.getActiveSession();

    if (activeSession) {
      await this.exitRequested();
      return;
    }

    await this.extensionService.unmount();

    await this.updateCurrentBadge();
  }

  async startRecording(): Promise<void> {
    if (!this.extensionService.isMountEnabled()) {
      return;
    }

    await this.restoreTabs();
    await this.tabsService.resetRecordingScopesFromAllowlist();

    await this.activeSessionService.start();

    await this.updateCurrentBadge();
  }

  async endRecording(): Promise<void> {
    if (!this.extensionService.isMountEnabled()) {
      return;
    }

    const activeSession =
      await this.activeSessionService.end();

    if (!activeSession) {
      return;
    }

    await this.updateCurrentBadge();

    // upload Recording
    void this.uploadRecording(activeSession)
    .catch(async error => {
      console.error(
        "Failed to upload recording",
        error,
      );

      if (error instanceof MissingAccessTokenError) {
        await this.badgeService.setUnauthenticatedWithTabs(
          this.tabsService.getTabs(),
        );
      }
    });
  }

  async exitRecording(): Promise<void> {
    if (!this.extensionService.isMountEnabled()) {
      return;
    }

    const activeSession =
      await this.activeSessionService.end();

    if (!activeSession) {
      return;
    }

    try {
      await this.uploadRecording(activeSession);

      await this.finalizeRecording();

      await this.updateCurrentBadge();
    }
    catch (error) {
      console.error(
        "Failed to upload recording",
        error,
      );

      if (error instanceof MissingAccessTokenError) {
        await this.badgeService.setUnauthenticatedWithTabs(
          this.tabsService.getTabs(),
        );
      }
    }
    finally {
      await this.unmount();
    }
  }

  async pauseRecording(): Promise<void> {
    await this.activeSessionService.pause();

    await this.updateCurrentBadge();
  }

  async resumeRecording(): Promise<void> {
    await this.activeSessionService.resume();

    await this.updateCurrentBadge();
  }

  async finalizeRecording(): Promise<void> {
    await this.activeSessionService.finalize();

    await this.traceService.clearTraces();

    await this.updateCurrentBadge();
  }

  async finalizeRecordingFailed(): Promise<void> {
    await this.activeSessionService.finalize();

    await this.updateCurrentBadge();
  }

  async collapse() {
    await this.activeSessionService.updatePage("collapsed");
  }

  async expand() {
    await this.activeSessionService.updatePage("expanded");
  }

  async exitRequested() {
    await this.activeSessionService.updatePage("exit");
  }

  async endRequested() {
    await this.activeSessionService.updatePage("end");
  }
  
  async setTabRecording(tabId: number) {
    await this.tabsService.setRecording(tabId);

    await this.updateCurrentBadge();
  }

  async setTabExcluded(tabId: number) {
    await this.tabsService.setExcluded(tabId);

    await this.updateCurrentBadge();
  }

  async setActiveSessionName(
    name: string,
  ): Promise<ActiveSession | undefined> {
    return this.activeSessionService.setName(name);
  }

  async dismissNotification(
    id: string,
  ): Promise<void> {
    await this.notificationService.dismiss();
  }

  async reuploadRecording(
    sessionId: string,
  ): Promise<ActiveSession | undefined> {
    const session =
      this.sessionsService.getSession(sessionId);

    if (!session) {
      return;
    }

    const traces =
      await this.traceService.getTracesById(
        session.clientId,
      );

    const filtered =
      this.traceProcessorService.prepareTraces(
        traces,
      );

    const uploadSession: ActiveSession = {
      ...session,
      urls:
        this.traceProcessorService.getDomains(
          filtered,
        ),
      eventCount: filtered.length,
      uploadStatus: "uploaded",
    }

    try {
      const created =
        await this.sessionsService.createSession(
          uploadSession,
        );

      await this.traceService.uploadTraces(filtered);

      // delete it from local storage
      await this.sessionsService.replaceSession(
        created,
      );

      await this.traceService.clearTracesById(
        sessionId,
      );

      return created;
    }
    catch (error) {

      if (error instanceof MissingAccessTokenError) {
        this.badgeService.setUnauthenticatedWithTabs(
          this.tabsService.getTabs(),
        );
      }

      return undefined;
    }
  }

  private async uploadRecording(
    session: ActiveSession,
  ): Promise<void> {
    const traces =
      await this.traceService.getTracesById(
        session.clientId,
      );

    const filtered =
        this.traceProcessorService.prepareTraces(traces);

    const uploadSession: ActiveSession = {
      ...session,
      urls: this.traceProcessorService.getDomains(filtered),
      eventCount: filtered.length,
      uploadStatus: "uploaded",
    };

    try {
      const created =
        await this.sessionsService.createSession(
          uploadSession,
        );

      await this.traceService.uploadTraces(filtered);

      await this.activeSessionService.markUploaded();
    }
    catch (error) {

      // upload failed
      await this.sessionsService.setSession(
        {
          ...uploadSession,
          uploadStatus: "failed",
        },
        true,
      );

      await this.activeSessionService.markUploadFailed();

      if (error instanceof MissingAccessTokenError) {
        this.badgeService.setUnauthenticatedWithTabs(
          this.tabsService.getTabs(),
        );
      }

      throw error;
    }
  }

  async handleInstalled(
    details: chrome.runtime.InstalledDetails,
  ): Promise<void> {
    if (details.reason === "install") {
      await this.tabsService.addOriginsToAllowlist(
        DEFAULT_ORIGINS,
      );

      await chrome.tabs.create({
        url: env.apiUrl
      });
    }

    await chrome.contextMenus.removeAll();

    await this.createContextMenus();
  }

  private async createContextMenus(): Promise<void> {
    await chrome.contextMenus.removeAll();

    chrome.contextMenus.create({
      id: SIGN_IN_MENU_ID,
      title: "Sign in",
      contexts: ["action"],
    });
  }

  async handleLoginMessage(
    msg: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (res?: any) => void,
  ): Promise<void> {
    if (!sender.origin?.startsWith(env.apiUrl)) {
      sendResponse({
        ok: false,
        error: "Unauthorized sender",
      });
      return;
    }

    if (msg?.type !== "AUTH_CODE") {
      sendResponse({
        ok: false,
        error: "Invalid message type",
      });
      return;
    }

    try {
      await this.authService.completeLogin(
        msg.code,
      );

      this.updateCurrentBadge();

      sendResponse({ ok: true });
    } catch (err) {
      sendResponse({
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Unknown error",
      });
    }
  }

  async toggleMount(): Promise<void> {
    const currentMountState =
      this.extensionService.isMountEnabled();

    if (currentMountState) {
      await this.unmount();
    } else {
      await this.mount();
    }
  }
  
  /**
   * Handles clicks on the extension action button.
   */
  async handleActionClick(
    tabId: number
  ): Promise<void> {
    await this.toggleMount();
  }

  async promptHostPermission(
    tabId: number,
  ): Promise<void> {
    await this.notificationService.notify(
      NotificationDefinitions.HostPermissionRequired,
      {
        tabId,
      },
    );

    await this.extensionService.setOptionsPage();
    await chrome.runtime.openOptionsPage();
  }

  async handleTabNavigated(
    tabId: number,
    urlString: string,
  ) {
    const url = new URL(urlString);

    const isSupported =
      this.contentScriptService.isSupported(
        url.protocol,
      );

    const isAllowlisted =
      this.tabsService.isAllowlisted(
        url.origin,
      );

    const recordingScope = !isSupported
      ? "unsupported"
      : isAllowlisted
        ? "recording"
        : "not_in_scope";

    await this.tabsService.addTab({
      tabId,
      url: urlString,
      origin: url.origin,
      recordingScope,
      connected: false,
    });

    await this.updateCurrentBadge();
  }

  async handleTabRemoved(tabId: number) {
    await this.tabsService.removeTab(tabId);

    await this.updateCurrentBadge();
  }

  async handleTabUpdated(
    tabId: number,
    windowId: number,
    title?: string,
    googleDocId?: string,
  ) {
    const tab =
      this.tabsService.getTab(
        tabId,
      );

    if (
      googleDocId &&
      tab?.googleDocId !== googleDocId
    ) {
      await this.googleDocsService.init(
        tabId,
        googleDocId,
      );
    }

    await this.tabsService.updateTab(
      tabId,
      {
        windowId,
        title,
        googleDocId,
      },
    );

    const connected =
      await this.contentScriptService.isInjected(
        tabId,
      );

    await this.tabsService.setConnected(
      tabId,
      connected,
    );

    await this.updateCurrentBadge();
  }

  /**
   * Restores an activated tab if it is not
   * currently tracked locally.
   */
  async handleTabActivated(
    tabId: number,
  ): Promise<void> {
    const tab =
      this.tabsService.getTab(tabId);

    if (!tab) {
      return;
    }

    const chromeTab =
      await chrome.tabs.get(tabId);

    if (!chromeTab.url) {
      return;
    }

    const url =
      new URL(chromeTab.url);

    const isSupported =
      this.contentScriptService.isSupported(
        url.protocol,
      );

    const isAllowlisted =
      this.tabsService.isAllowlisted(
        url.origin,
      );

    const recordingScope = !isSupported
      ? "unsupported"
      : isAllowlisted
        ? "recording"
        : "not_in_scope";

    await this.tabsService.addTab({
      tabId,
      url: chromeTab.url,
      origin: url.origin,
      recordingScope,
      connected: false,
      title: chromeTab.title,
    });

    await this.updateCurrentBadge();
  }

  async handleContextMenuClicked(
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab,
  ): Promise<void> {
    switch (info.menuItemId) {
      case SIGN_IN_MENU_ID: {
        await this.authService.openLogin();
        break;
      }
    }
  }

  async addToAllowlist(
    tabId: number,
  ): Promise<void> {
    const tab = this.tabsService.getTab(tabId);

    if (!tab) {
      return;
    }

    await this.tabsService.addToAllowlist(
      tab.origin,
    );
  }

  private async restoreTabs() {
    await this.removeStaleTabs();

    const tabs =
      this.tabsService.getTabs();

    await Promise.allSettled(
      tabs.map(async tab => {
        const connected =
          await this.contentScriptService.isInjected(
            tab.tabId,
          );

        await this.tabsService.setConnected(
          tab.tabId,
          connected,
        );
      }),
    );
  }

  private async removeStaleTabs(): Promise<void> {
    const chromeTabs =
      await chrome.tabs.query({});

    const existingTabIds = new Set(
      chromeTabs
        .map(tab => tab.id)
        .filter(
          (id): id is number =>
            id !== undefined,
        ),
    );

    const staleTabIds =
      this.tabsService
        .getTabs()
        .filter(tab =>
          !existingTabIds.has(tab.tabId),
        )
        .map(tab => tab.tabId);

    await this.tabsService.removeTabs(
      staleTabIds,
    );
  }

  private async updateCurrentBadge(): Promise<void> {
    if (this.authService.isAccessTokenMissing()) {
      return;
    }
    await this.badgeService.updateBadge(
      this.tabsService.getTabs(),
      this.extensionService.isMountEnabled(),
      this.activeSessionService.getActiveSession(),
    );
  }
}
