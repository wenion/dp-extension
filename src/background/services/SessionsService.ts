import { SessionApi } from "../api/SessionApi";

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

  async fetchSessions(
    limit: number = 5,
  ): Promise<readonly Session[]> {
    const { items, } = await this.sessionApi.list(limit);

    this.sessionsRepository.setSessions(items);
    await this.notifySessionsUpdated();

    return items;
  }

  async fetchSession(
    sessionId: string,
  ): Promise<Session | undefined> {
    const session = await this.sessionApi.get(sessionId);

    if (session) {
      this.sessionsRepository.setSession(session);
      await this.notifySessionsUpdated();
    }

    return session;
  }

  /**
   * Persists a session in the backend.
   *
   * If the session already exists, it is updated instead.
   */
  async createSession(
    session: Session
  ): Promise<void> {
    const created =
      await this.sessionApi.create(session);

    this.sessionsRepository.setSession(created);

    await this.notifySessionsUpdated();
  }

  async renameSession(
    sessionId: string,
    name: string,
  ): Promise<Session> {
    const updated =
      await this.sessionApi.update(
        sessionId,
        { name },
      );

    await this.notifySessionsUpdated();

    return updated;
  }

  async saveFailedSession(
    session: Session,
  ): Promise<void> {
    await this.sessionsRepository.setLocal(session);

    await this.notifySessionsUpdated();
  }

  async deleteSession(
    sessionId: string,
  ): Promise<void> {
    await this.sessionsRepository.deleteLocal(sessionId);
    await this.notifySessionsUpdated();
  }

  getSessions(): readonly Session[] {
    return this.sessionsRepository.getAll()
      .sort((a, b) => b.startedAt - a.startedAt);
  }
  
  getSession(
    sessionId: string,
  ): Session | undefined {
    return this.sessionsRepository.get(sessionId);
  }

  private async notifySessionsUpdated() {
    await this.contentScriptClient.broadcast({
      type: "SESSIONS/UPDATED",
      payload: this.sessionsRepository.getAll(),
    });
  }
}
