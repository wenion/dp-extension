import { SessionApi } from "../api/SessionApi";

import type { SessionsRepository } from "../repositories/SessionsRepository";
import type { ContentScriptClient } from "../clients/ContentScriptClient";

import type { Session } from "@/shared/types";

/**
 * Manages session data.
 *
 * Keeps the session cache synchronized with
 * local persistence and the backend, and notifies
 * connected pages when sessions change.
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
    this.sessionsRepository =
      sessionsRepository;
    this.contentScriptClient =
      contentScriptClient;
  }

  async fetchSessions(
    limit: number = 5,
  ): Promise<readonly Session[]> {
    const { items } =
      await this.sessionApi.list(limit);

    await this.sessionsRepository.setSessions(
      items
    );

    await this.notifySessionsUpdated();

    return items;
  }

  async fetchSession(
    sessionId: string,
  ): Promise<Session | undefined> {
    const session =
      await this.sessionApi.get(
        sessionId,
      );

    if (!session) {
      return undefined;
    }

    await this.sessionsRepository.setSession(
      session,
    );

    await this.notifySessionsUpdated();

    return session;
  }

  /**
   * Creates a session in the backend
   * and stores the returned session
   * in memory.
   */
  async createSession(
    session: Session
  ): Promise<Session> {
    const created =
      await this.sessionApi.create(
        session,
      );

    this.sessionsRepository.setSession(
      created,
    );

    await this.notifySessionsUpdated();

    return created;
  }

  /**
   * Stores a session in memory and,
   * optionally, persists it locally.
   */
  async setSession(
    session: Session,
    persistLocal = false,
  ): Promise<void> {
    await this.sessionsRepository.setSession(
      session,
      persistLocal,
    );

    await this.notifySessionsUpdated();
  }

  /**
   * Updates either a locally persisted
   * session or a backend session.
   */
  async updateSession(
    clientId: string,
    updates: Partial<Session>,
  ): Promise<void> {
    const session =
      this.sessionsRepository.get(
        clientId,
      );

    if (!session) {
      return;
    }

    const localSession =
      await this.sessionsRepository.getLocal(
        clientId,
      );

    if (localSession) {
      await this.sessionsRepository.setSession(
        {
          ...localSession,
          ...updates,
        },
        true,
      );

      await this.notifySessionsUpdated();
      return;
    }

    const updated =
      await this.sessionApi.update(
        clientId,
        updates,
      );

    await this.sessionsRepository.setSession(
      updated,
    );

    await this.notifySessionsUpdated();
  }

  /**
   * Removes a session from memory and,
   * optionally, from local persistence.
   */
  async deleteSession(
    clientId: string,
    deleteLocal = false,
  ): Promise<void> {
    await this.sessionsRepository.deleteSession(
      clientId,
      deleteLocal,
    );

    await this.notifySessionsUpdated();
  }

  /**
   * Replaces a local session with the
   * backend-created version.
   */
  async replaceSession(
    session: Session,
  ): Promise<void> {
    await this.sessionsRepository.deleteSession(
      session.clientId,
      true,
    );

    await this.sessionsRepository.setSession(
      session,
    );

    await this.notifySessionsUpdated();
  }

  getSessions(): readonly Session[] {
    return this.sessionsRepository
      .getAll()
      .sort(
        (a, b) =>
          b.startedAt - a.startedAt,
      );
  }
  
  getSession(
    sessionId: string,
  ): Session | undefined {
    return this.sessionsRepository.get(
      sessionId,
    );
  }

  private async notifySessionsUpdated() {
    await this.contentScriptClient.broadcast({
      type: "SESSIONS/UPDATED",
      payload: this.getSessions(),
    });
  }
}
