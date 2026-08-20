import type { ActiveSessionRepository } from "../repositories/ActiveSessionRepository";
import type { ContentScriptClient } from "../clients/ContentScriptClient";

import type {
  ActiveSession,
  PanelPage,
} from "@/shared/types";

export class ActiveSessionService {
  private readonly activeSessionRepository: ActiveSessionRepository;
  private readonly contentScriptClient: ContentScriptClient;

  constructor(
    activeSessionRepository: ActiveSessionRepository,
    contentScriptClient: ContentScriptClient,
  ) {
    this.activeSessionRepository = activeSessionRepository;
    this.contentScriptClient = contentScriptClient;
  }

  getActiveSession(): ActiveSession | undefined {
    return this.activeSessionRepository.getActiveSession();
  }

  /**
   * Ensures there is an active recording session.
   *
   * Returns the existing session if one is already active;
   * otherwise, creates a new session.
   */
  async start(): Promise<ActiveSession> {
    const active = this.getActiveSession();

    if (!active) {
      return this.createNewActiveSession();
    }

    // Recording in progress.
    if (active.endedAt === undefined) {
      await this.notifySessionUpdated();
      return active;
    }

    // Upload still in progress.
    if (active.uploadStatus === "uploading") {
      await this.notifySessionUpdated();
      return active;
    }

    return this.createNewActiveSession();
  }

  /**
   * Ends the active recording session.
   *
   * @throws {MissingActiveSessionError}
   * If no active session exists.
   */
  async end(): Promise<ActiveSession | undefined> {
    const active = this.getActiveSession();

    if (!active) {
      return undefined;
    }

    if (active.endedAt) {
      return active;
    }

    const updated: ActiveSession = {
      ...active,
      endedAt: Date.now(),
      captureState: "paused",
      uploadStatus: "uploading",
    };

    await this.activeSessionRepository.setActiveSession(updated);

    await this.notifySessionUpdated();

    return updated;
  }

  async markUploaded(): Promise<ActiveSession | undefined> {
    const active = this.getActiveSession();

    if (!active) {
      return undefined;
    }

    // if (active.uploadStatus !== "uploading") {
    //   return active;
    // }

    const updated: ActiveSession = {
      ...active,
      uploadStatus: "uploaded",
    };

    await this.activeSessionRepository.setActiveSession(updated);

    await this.notifySessionUpdated();

    return updated;
  }


  async markUploadFailed(): Promise<ActiveSession | undefined> {
    const active = this.getActiveSession();

    if (!active) {
      return undefined;
    }

    // if (active.uploadStatus !== "uploading") {
    //   return active;
    // }

    const updated: ActiveSession = {
      ...active,
      uploadStatus: "failed",
    };

    await this.activeSessionRepository.setActiveSession(updated);

    await this.notifySessionUpdated();

    return updated;
  }

  async finalize(): Promise<void> {
    const active = this.getActiveSession();

    if (!active) {
      return;
    }

    if (
      active.uploadStatus !== "uploaded" &&
      active.uploadStatus !== "failed"
    ) {
      return;
    }

    await this.activeSessionRepository.clearActiveSession();
    
    await this.notifySessionUpdated();
  }

  async pause(): Promise<ActiveSession | undefined> {
    const active = this.getActiveSession();

    if (!active) {
      return;
    }

    if (active.captureState === "paused") {
      return active;
    }

    const updated: ActiveSession = {
      ...active,
      captureState: "paused",
    };

    await this.activeSessionRepository.setActiveSession(updated);

    await this.notifySessionUpdated();

    return updated;
  }

  async resume(): Promise<ActiveSession | undefined> {
    const active = this.getActiveSession();

    if (!active) {
      return;
    }

    if (active.captureState === "recording") {
      return active;
    }

    const updated: ActiveSession = {
      ...active,
      captureState: "recording",
    };

    await this.activeSessionRepository.setActiveSession(updated);

    await this.notifySessionUpdated();

    return updated;
  }

  async updatePage(
    page: PanelPage,
  ): Promise<ActiveSession | undefined> {
    const active = this.getActiveSession();

    if (!active) {
      return;
    }

    if (active.page === page) {
      return active;
    }

    const updated: ActiveSession = {
      ...active,
      page,
    };

    await this.activeSessionRepository.setActiveSession(updated);

    await this.notifySessionUpdated();

    return updated;
  }

  async incrementEventCount(): Promise<ActiveSession | undefined> {
    const active = this.getActiveSession();

    if (!active) {
      return;
    }

    const updated: ActiveSession = {
      ...active,
      eventCount: active.eventCount + 1,
    };

    await this.activeSessionRepository.setActiveSession(updated);

    await this.notifySessionUpdated();

    return updated;
  }

  async setUrls(urls: string[]): Promise<ActiveSession | undefined> {
    const active = this.getActiveSession();

    if (!active) {
      return;
    }

    const updated: ActiveSession = {
      ...active,
      urls,
    };

    await this.activeSessionRepository.setActiveSession(updated);

    await this.notifySessionUpdated();

    return updated;
  }

  async setName(name: string): Promise<ActiveSession | undefined> {
    const active = this.getActiveSession();

    if (!active) {
      return;
    }

    const updated: ActiveSession = {
      ...active,
      name,
    };

    await this.activeSessionRepository.setActiveSession(updated);

    await this.notifySessionUpdated();

    return updated;
  }

  private async createNewActiveSession(): Promise<ActiveSession> {
    const active: ActiveSession = {
      clientId: crypto.randomUUID(),
      startedAt: Date.now(),
      eventCount: 0,
      captureState: "recording",
      // uploadStatus: "waiting",
      uploadStatus: "uploading",
      page: "collapsed",
    };

    await this.activeSessionRepository.setActiveSession(active);

    await this.notifySessionUpdated();

    return active;
  }

  private async notifySessionUpdated() {
    await this.contentScriptClient.broadcast({
      type: "SESSION/UPDATED",
      payload: this.getActiveSession(),
    });
  }
}
