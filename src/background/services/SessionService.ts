import type { StateRepository } from "../repositories/StateRepository";
import type { ContentScriptClient } from "../clients/ContentScriptClient";

import type { Session } from "@/shared/types";
import { MissingActiveSessionError } from "./errors/MissingActiveSessionError";

export class SessionService {
  private readonly stateRepository: StateRepository;
  private readonly contentScriptClient: ContentScriptClient;

  constructor(
    stateRepository: StateRepository,
    contentScriptClient: ContentScriptClient,
  ) {
    this.stateRepository = stateRepository;
    this.contentScriptClient = contentScriptClient;
  }

  getActiveSession(): Session | undefined {
    return this.stateRepository.getActiveSession();
  }

  async create(): Promise<Session> {
    const active =
      this.stateRepository.getActiveSession();

    if (active) {
      // TODO
      return active;
    }

    const created : Session = {
      clientId: crypto.randomUUID(),
      startedAt: Date.now(),
      eventCount: 0,
      captureState: "recording",
      uploadStatus: "waiting",
    };

    await this.updateActiveSession(created);

    return created;
  }

  async end() {
    return this.patchActiveSession({
      endedAt: Date.now(),
      captureState: "paused",
      // uploadStatus: "uploading",
    });
  }

  async finalize() {
    await this.clearActiveSession();
  }

  async pause() {
    return this.patchActiveSession({
      captureState: "paused",
    });
  }

  async resume() {
    return this.patchActiveSession({
      captureState: "recording",
    });
  }

  async markUploading() {
    return this.patchActiveSession({
      uploadStatus: "uploading",
    });
  }

  async markUploaded() {
    return this.patchActiveSession({
      uploadStatus: "uploaded",
    });
  }

  async markFailed() {
    return this.patchActiveSession({
      uploadStatus: "failed",
    });
  }

  async incrementEventCount() {
    const active =
      this.stateRepository.getActiveSession();

    if (!active) {
      throw new MissingActiveSessionError();
    }

    const session: Session = {
      ...active,
      eventCount: active.eventCount++,
    };

    await this.stateRepository.setActiveSession(session);
    
    return session;
  }

  async setUrls(urls: string[]) {
    const active =
      this.stateRepository.getActiveSession();

    if (!active) {
      throw new MissingActiveSessionError();
    }

    const session: Session = {
      ...active,
      urls: urls,
    };

    await this.stateRepository.setActiveSession(session);
    
    return session;
  }

  async setName(name: string) {
    const active =
      this.stateRepository.getActiveSession();

    if (!active) {
      throw new MissingActiveSessionError();
    }

    const session: Session = {
      ...active,
      name: name,
    };

    await this.stateRepository.setActiveSession(session);
    
    return session;
  }

  private async patchActiveSession(
    patch: Partial<Session>,
  ): Promise<Session> {
    const active =
      this.stateRepository.getActiveSession();

    if (!active) {
      throw new MissingActiveSessionError();
    }

    const session: Session = {
      ...active,
      ...patch,
    };

    await this.updateActiveSession(session);

    return session;
  }

  private async updateActiveSession(session: Session) {
    await this.stateRepository.setActiveSession(session);

    await this.notifySessionUpdated();
  }

  private async clearActiveSession() {
    await this.stateRepository.clearActiveSession();

    await this.notifySessionUpdated();
  }

  private async notifySessionUpdated() {
    await this.contentScriptClient.broadcast({
      type: "SESSION/UPDATED",
      payload: this.stateRepository.getActiveSession(),
    });
  }
}
