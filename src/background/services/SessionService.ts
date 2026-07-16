import type { Storage } from "../storage/Storage";
import type { ContentScriptClient } from "../clients/ContentScriptClient";
import type { PageService } from "./PageService";
import type { SessionPersistenceService } from "./SessionPersistenceService";
import type { UploadService } from "./UploadService";

import type { Session } from "@/shared/types";


export class SessionService {
  private readonly storage: Storage;
  private readonly contentScriptClient: ContentScriptClient;
  private readonly pageService: PageService;
  private readonly sessionPersistenceService: SessionPersistenceService;
  private readonly uploadService: UploadService;

  constructor(
    storage: Storage,
    contentScriptClient: ContentScriptClient,
    pageService: PageService,
    sessionPersistenceService: SessionPersistenceService,
    uploadService: UploadService,
  ) {
    this.storage = storage;
    this.contentScriptClient = contentScriptClient;
    this.pageService = pageService;
    this.sessionPersistenceService = sessionPersistenceService;
    this.uploadService = uploadService;
  }

  async startSession() {
    const session = await this.createSession();

    await this.pageService.onSessionStarted();

    // TODO cache/api request
    const created = await this.sessionPersistenceService
      .createSession(session);

    if (created) {
      await this.updateSession(created);
    } else {

    }
  }

  async endSession() {
    const session = await this.updateSession({
      endedAt: Date.now(),
      captureState: "paused",
      uploadStatus: "uploading",
    });

    if (!session) return;

    await this.pageService.onSessionEnded();

    // TODO update badge

    // upload traces
    const result = await this.uploadService.uploadTraces();

    console.log("result", result)

    if (!result.success) {
      await this.handleUploadFailed();
      return;
    }

    const patch = {
      uploadStatus: "uploaded" as const,
      urls: result.domains ?? [],
    };

    // update local session to the remote
    const response = await this.sessionPersistenceService.updateSession(
      session.clientId,
      patch,
    );

    if (response) {
      await this.handleUploadSucceeded(response);
    }
    else {
      await this.handleUploadFailed();
    }
  }

  async finishSession() {
    await this.uploadService.finishTraces();

    await this.pageService.onFinish();

    const session = this.getActiveSession();
    if (session) {
      await this.sessionPersistenceService.appendSession(session);
    }

    await this.deleteSession();
  }

  async pauseSession() {
    await this.updateSession({
      captureState: "paused",
    });
  }

  async resumeSession() {
    
    await this.updateSession({
      captureState: "recording",
    });
  }

  getActiveSession() {
    return this.storage.getActiveSession();
  }

  isRecording() {
    return this.storage.getActiveSession()?.captureState === "recording";
  }
  
  private async createSession(): Promise<Session> {
    const existing = this.storage.getActiveSession();

    if (existing) {
      return existing;
    }

    const session : Session = {
      clientId: crypto.randomUUID(),
      startedAt: Date.now(),
      eventCount: 0,
      captureState: "recording",
      uploadStatus: "waiting",
    };

    await this.storage.setActiveSession(session);
    await this.notifySessionUpdated();

    return session;
  }

  /**
   * Update active session and notify frontend.
   */
  private async updateSession(
    patch: Partial<Session>,
  ): Promise<Session| undefined> {
    const session = this.storage.getActiveSession();

    if (!session) return;

    const updated: Session = {
      ...session,
      ...patch,
    };

    await this.storage.setActiveSession(updated);

    await this.notifySessionUpdated();

    return updated;
  }

  private async handleUploadSucceeded(updated: Session) {
    await this.storage.setActiveSession(updated);

    await this.notifySessionUpdated();

    await this.pageService.onUploadSucceeded();
  }

  private async handleUploadFailed() {
    await this.updateSession({
      uploadStatus: "failed",
    });

    await this.pageService.onUploadFailed();
  }

  private async deleteSession() {
    await this.storage.clearActiveSession();

    await this.notifySessionUpdated();
  }

  private async notifySessionUpdated() {
    await this.contentScriptClient.broadcast({
      type: "SESSION/UPDATED",
      payload: this.storage.getActiveSession(),
    });
  }
}
