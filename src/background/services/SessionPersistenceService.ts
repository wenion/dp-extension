import type { ApiClient } from "../api/ApiClient";
import type { Storage } from "../storage/Storage";
import type { ContentScriptClient } from "../clients/ContentScriptClient";

import type { Session } from "@/shared/types";

/**
 * Handles persistence of session data.
 *
 * Responsible for communicating with the server and
 * maintaining the cached session list for the options page.
 *
 * Does not manage the active recording session.
 */
export class SessionPersistenceService {
  private readonly api: ApiClient;
  private readonly storage: Storage;
  private readonly contentScriptClient: ContentScriptClient;

  constructor(
    api: ApiClient,
    contentScriptClient: ContentScriptClient,
    storage: Storage,
  ) {
    this.api = api;
    this.contentScriptClient = contentScriptClient;
    this.storage = storage;
  }

  async appendSession(session: Session) {
    await this.storage.appendSession(session);

    await this.notifySessionsUpdated();
  }

  async refreshSessions() {
    const { items, } = await this.api.session.list();

    await this.storage.setSessions(items);
    await this.notifySessionsUpdated();
  }

  // only add new session to remote sessions
  async createSession(session: Session): Promise<Session> {
    return await this.api.session.create(session);
  }

  async updateSession(
    sessionId: string,
    patch: Partial<Session>,
  ): Promise<Session> {
    return await this.api.session.update(sessionId, patch);
  }

  async renameSession(
    sessionId: string,
    newTitle: string,
  ): Promise<boolean> {
    const session = this.storage.getSessionById(sessionId);

    if (!session) {
        return false;
    }

    const result = await this.api.session.update(
      sessionId,
      {
          ...session,
          name: newTitle,
      },
    );

    if (!result) {
      return false;
    }

    await this.storage.updateSession(
      sessionId,
      {
        name: newTitle,
      },
    );

    return true;
  }

  private async notifySessionsUpdated() {
    await this.contentScriptClient.broadcast({
      type: "SESSIONS/UPDATED",
      payload: this.storage.getSessions(),
    });
  }

}
