import { env } from "@/config/env";

import type { ActiveSessionService } from "../services/ActiveSessionService";
import type { AuthenticationService } from "../services/AuthenticationService";
import type { BadgeService } from "../services/BadgeService";
import type { ContentScriptService } from "../services/ContentScriptService";
import type { ExtensionService } from "../services/ExtensionService";
import type { NotificationService } from "../services/NotificationService";
import type { SessionsService } from "../services/SessionsService";
import type { TabsService } from "../services/TabsService";
import type { TraceService } from "../services/TraceService";
import type { TraceProcessorService } from "../services/TraceProcessorService";

import { MissingAccessTokenError } from "../network/errors/MissingAccessTokenError";
import { NotificationDefinitions } from "../services/NotificationService/NotificationDefinitions";

import {  
  InjectionPermission,
  InjectionResult,
} from "@/shared/content-script";
import type {
  ActiveSession,
  ContentState,
  OptionsState,
  Trace,
} from "@/shared/types";

export class ExtensionController {
  private activeSessionService: ActiveSessionService;
  private authService: AuthenticationService;
  private badgeService: BadgeService;
  private contentScriptService: ContentScriptService;
  private extensionService: ExtensionService;
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
    this.notificationService = notificationService;
    this.sessionsService = sessionsService;
    this.tabsService = tabsService;
    this.traceService = traceService;
    this.traceProcessorService = traceProcessorService;
  }

  async onBackgroundStartup() {
    try {
      await this.sessionsService.fetchSessions();

      await this.badgeService.setDisabled();
    } catch (error) {
      if (error instanceof MissingAccessTokenError) {
        await this.notificationService.notify(
          NotificationDefinitions.NotLoggedIn,
        );

        await this.badgeService.setUnauthenticated();
        return;
      }

      throw error;
    }

    const currentMountState =
      this.extensionService.isMountEnabled();
    if (currentMountState) {
      await this.badgeService.setReady();
    }
  }

  async onContentConnected(tabId: number) {
    const state: ContentState = {
      mount: this.extensionService.isMountEnabled(),
      activeSession: this.activeSessionService.getActiveSession(),
      tabs: this.tabsService.getTabs(),
      tabId,
    }

    this.extensionService.notifyContent(state);
  }

  async onOptionsConnected() {
    const state: OptionsState = {
      mount: this.extensionService.isMountEnabled(),
      activeSession: this.activeSessionService.getActiveSession(),
      tabs: this.tabsService.getTabs(),
      sessions: this.sessionsService.getSessions(),
      currentNotification: this.notificationService.getCurrentNotification(),
      notifications: this.notificationService.getNotifications(),
    }

    await this.extensionService.notifyOptions(state);
  }

  private async mount() {
    await this.extensionService.mount();

    await this.badgeService.updateBadge(
      this.tabsService.getTabs(),
      this.extensionService.isMountEnabled(),
      this.activeSessionService.getActiveSession(),
    );
  }

  private async unmount() {
    const activeSession =
      this.activeSessionService.getActiveSession();

    if (activeSession) {
      await this.exitRequested();
      return;
    }

    await this.extensionService.unmount();

    await this.badgeService.updateBadge(
      this.tabsService.getTabs(),
      this.extensionService.isMountEnabled(),
      this.activeSessionService.getActiveSession(),
    );
  }

  async startRecording(): Promise<void> {
    if (!this.extensionService.isMountEnabled()) {
      return;
    }

    const created =
      await this.activeSessionService.start();

    await this.tabsService.setExcludedTabsToRecording();

    await this.badgeService.updateBadge(
      this.tabsService.getTabs(),
      this.extensionService.isMountEnabled(),
      this.activeSessionService.getActiveSession(),
    );
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

    await this.badgeService.updateBadge(
      this.tabsService.getTabs(),
      this.extensionService.isMountEnabled(),
      this.activeSessionService.getActiveSession(),
    );

    // upload Recording
    void this.uploadRecording(activeSession);
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
    } catch {
      // Todo
    }

    // show dialog

    // unmount
    await this.unmount();

    await this.badgeService.updateBadge(
      this.tabsService.getTabs(),
      this.extensionService.isMountEnabled(),
      this.activeSessionService.getActiveSession(),
    );
  }

  async pauseRecording(): Promise<void> {
    await this.activeSessionService.pause();

    await this.badgeService.updateBadge(
      this.tabsService.getTabs(),
      this.extensionService.isMountEnabled(),
      this.activeSessionService.getActiveSession(),
    );
  }

  async resumeRecording(): Promise<void> {
    await this.activeSessionService.resume();

    await this.badgeService.updateBadge(
      this.tabsService.getTabs(),
      this.extensionService.isMountEnabled(),
      this.activeSessionService.getActiveSession(),
    );
  }

  async finalizeRecording(): Promise<void> {
    await this.activeSessionService.finalize();

    await this.traceService.clearTraces();

    await this.updateBadge();
  }

  async finalizeRecordingFailed(): Promise<void> {
    await this.activeSessionService.finalize();

    await this.updateBadge();
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

    await this.badgeService.updateBadge(
      this.tabsService.getTabs(),
      this.extensionService.isMountEnabled(),
      this.activeSessionService.getActiveSession(),
    );
  }

  async setTabExcluded(tabId: number) {
    await this.tabsService.setExcluded(tabId);

    await this.badgeService.updateBadge(
      this.tabsService.getTabs(),
      this.extensionService.isMountEnabled(),
      this.activeSessionService.getActiveSession(),
    );
  }

  async setActiveSessionName(
    name: string,
  ): Promise<ActiveSession | undefined> {
    return this.activeSessionService.setName(name);
  }

  async showNotice(
    tabId: number,
    message?: string,
  ): Promise<void> {
    await this.activeSessionService.showNotice(
      tabId,
      message,
    );
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
      await this.traceService.getTracesById(session.clientId);

    const filtered =
        this.traceProcessorService.prepareTraces(traces);

    const uploadSession: ActiveSession = {
      ...session,
      urls: this.traceProcessorService.getDomains(filtered),
      eventCount: filtered.length,
      uploadStatus: "uploaded",
    }

    try {
      await this.sessionsService.createSession(uploadSession);

      await this.traceService.uploadTraces(traces);

      await this.sessionsService.deleteSession(sessionId);
      await this.traceService.clearTracesById(sessionId);

      return uploadSession;
    } catch (error) {

      if (error instanceof MissingAccessTokenError) {
        await this.notificationService.notify(
          NotificationDefinitions.NotLoggedIn,
        );
        return;
      }

      return undefined;
      // throw error;
    }
  }

  private async uploadRecording(
    session: ActiveSession,
  ): Promise<void> {
    const traces =
      await this.traceService.getTracesById(session.clientId);

    const filtered =
        this.traceProcessorService.prepareTraces(traces);

    const uploadSession: ActiveSession = {
      ...session,
      urls: this.traceProcessorService.getDomains(filtered),
      eventCount: filtered.length,
      uploadStatus: "uploaded",
    }

    try {
      await this.sessionsService.createSession(uploadSession);

      await this.traceService.uploadTraces(traces);

      await this.activeSessionService.markUploaded();
    } catch (error) {

      // upload failed
      await this.sessionsService.saveFailedSession({
        ...uploadSession,
        uploadStatus: "failed",
      });

      await this.activeSessionService.markUploadFailed();

      if (error instanceof MissingAccessTokenError) {
        await this.notificationService.notify(
          NotificationDefinitions.NotLoggedIn,
        );
        return;
      }
      throw error;
    }
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
    const result =
      await this.contentScriptService.inject(tabId);

    if (result !== InjectionResult.Success) {
      await this.tabsService.setConnected(tabId, false);

      if (result === InjectionResult.NoPermission) {
        await this.notificationService.notify(
          NotificationDefinitions.HostPermissionRequired,
          {
            tabId,
          }
        )
        await chrome.runtime.openOptionsPage();
      }
    }

    await this.toggleMount();
  }


  async handleTabNavigated(
    tabId: number,
    urlString: string,
  ) {
    const url = new URL(urlString);

    const permission =
      await this.contentScriptService.checkInjectionPermission(url);

    const recordingScope =
      permission === InjectionPermission.Allowed
        ? "recording"
        : permission === InjectionPermission.UnsupportedUrl
          ? "unsupported"
          : "not_in_scope";

    await this.tabsService.addTab(
      tabId,
      urlString,
      url.origin,
      recordingScope,
      false,
    );

    if (recordingScope === "recording") {
      const result =
        await this.contentScriptService.executeInjection(tabId);
      if (result === InjectionResult.Success) {
        await this.tabsService.setConnected(
          tabId,
          true,
        );
      }
    }

    await this.updateBadge();
  }

  async handleTabRemoved(tabId: number) {
    await this.tabsService.removeTab(tabId);

    await this.updateBadge();
  }

  async handleTabUpdated(
    tabId: number,
    title?: string,
  ) {
    await this.tabsService.updateTitle(tabId, title);
  }

  async handleTabActivated(tabId: number) {
    const tab = this.tabsService.getTab(tabId);

    if (tab) {
      return;
    }

    try {
      const chromeTab = await chrome.tabs.get(tabId);

      if (!chromeTab.url) {
        return;
      }

      const url = new URL(chromeTab.url);

      // const permission =
      //   await this.contentScriptService.hasHostPermission(url);
      const permission =
        await this.contentScriptService.checkInjectionPermission(url);

      const recordingScope =
        permission === InjectionPermission.Allowed
          ? "recording"
          : permission === InjectionPermission.UnsupportedUrl
            ? "unsupported"
            : "not_in_scope";

      if (!tab) {
        await this.tabsService.addTab(
          tabId,
          chromeTab.url,
          url.origin,
          recordingScope,
          false,
          chromeTab.title,
        );
      }
    } catch {
      // Tab no longer exists.
    }

    await this.updateBadge();
  }

  async onHostPermissionsAdded(
    origins: readonly string[],
  ): Promise<void> {
    const added =
      await this.tabsService.setRecordingScopeByOrigins(
        origins,
        "recording",
      );

    await Promise.all(
      added.map(tab =>
        this.contentScriptService.inject(tab.tabId)
      ),
    );
  }

  async onHostPermissionsRemoved(
    origins: readonly string[],
  ): Promise<void> {
    const removed =
      await this.tabsService.setRecordingScopeByOrigins(
        origins,
        "not_in_scope",
      );
  }

  async injectContentScriptsByOrigin(origin: string) {
    const tabs = this.tabsService.getTabsByOrigin(origin);

    await Promise.all(
      tabs.map(async tab => {
        const result =
          await this.contentScriptService.executeInjection(tab.tabId);

        this.tabsService.setConnected(
          tab.tabId,
          result === InjectionResult.Success,
        );
      }),
    );
  }

  private async updateBadge(): Promise<void> {
    await this.badgeService.updateBadge(
      this.tabsService.getTabs(),
      this.extensionService.isMountEnabled(),
      this.activeSessionService.getActiveSession(),
    );
  }
}
