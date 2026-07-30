import type { SessionApi } from "../api/SessionApi";

import type { SessionsRepository } from "../repositories/SessionsRepository";
import type { ContentScriptClient } from "../clients/ContentScriptClient";

import type { Session } from "@/shared/types";

/**
 * Manages session data.
 *
 * Keeps the local session cache synchronized with
 * the backend and notifies connected pages when
 * the cached sessions change.
 */
export class SessionsService {
  private readonly sessionApi: SessionApi;
  private readonly sessionsRepository: SessionsRepository;
  private readonly contentScriptClient: ContentScriptClient;

  constructor(
    sessionApi: SessionApi,
    sessionsRepository: SessionsRepository,
    contentScriptClient: ContentScriptClient,
  ) {
    this.sessionApi = sessionApi;
    this.sessionsRepository = sessionsRepository;
    this.contentScriptClient = contentScriptClient;
  }

  async refreshSessions(): Promise<readonly Session[]> {
    const { items, } = await this.sessionApi.list();

    this.sessionsRepository.setSessions(items);
    await this.notifySessionsUpdated();

    return this.getSessions();
  }

  async fetchSession(
    sessionId: string,
  ): Promise<Session> {
    return this.sessionApi.get(sessionId);
  }

  async createSession(
    session: Session
  ): Promise<Session> {
    let created: Session = {
      ...session,
      uploadStatus: "failed",
    };

    try {
      await this.sessionApi.create(created);

      created = {
        ...created,
        uploadStatus: "uploading",
      };
    } catch (error) {
      console.error(error);
    }

    this.sessionsRepository.setSession(created);
    await this.notifySessionsUpdated();

    return created;
  }

  async updateSession(
    sessionId: string,
    session: Session,
  ): Promise<Session> {
    let updated = session;
    try {
      updated = await this.sessionApi.update(
        sessionId,
        session
      );
    } catch (error) {
      console.error(error);
      updated = {
        ...session,
        uploadStatus: "failed",
      }
    }

    this.sessionsRepository.setSession(updated);
    await this.notifySessionsUpdated();

    return updated;
  }

  async renameSession(
    sessionId: string,
    name: string,
  ): Promise<Session> {
    const updated = await this.sessionApi.update(
      sessionId,
      {
        name,
      },
    );

    this.sessionsRepository.setSession(updated);
    await this.notifySessionsUpdated();

    return updated;
  }

  getSessions(): readonly Session[] {
    return this.sessionsRepository.getSessions();
  }

  getSession(
    sessionId: string,
  ): Session | undefined {
    return this.sessionsRepository.getSession(sessionId);
  }

  private async notifySessionsUpdated() {
    await this.contentScriptClient.broadcast({
      type: "SESSIONS/UPDATED",
      payload: this.sessionsRepository.getSessions(),
    });
  }
}
