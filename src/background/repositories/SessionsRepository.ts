import { dbPromise } from "./db/AppDatabase";

import type { Session } from "@/shared/types";

const STORE_NAME = "sessions";

export class SessionsRepository {
  private readonly sessions = new Map<string, Session>();

  async initialize(): Promise<void> {
    const db = await dbPromise;
    const sessions = await db.getAll(STORE_NAME);

    this.sessions.clear();

    for (const session of sessions) {
      this.sessions.set(session.clientId, session);
    }
  }

  async setLocal(session: Session): Promise<void> {
    const db = await dbPromise;

    await db.put(STORE_NAME, session);

    this.sessions.set(session.clientId, session);
  }

  async deleteLocal(
    clientId: string,
  ): Promise<void> {
    const db = await dbPromise;

    await db.delete(STORE_NAME, clientId);

    this.sessions.delete(clientId);
  }

  setSession(session: Session) {
    this.sessions.set(session.clientId, session);
  }

  setSessions(sessions: readonly Session[]) {
    for (const session of sessions) {
      this.sessions.set(session.clientId, session);
    }
  }

  get(
    clientId: string,
  ): Session | undefined {
    return this.sessions.get(clientId);
  }

  getAll(): Session[] {
    return Array.from(this.sessions.values());
  }
}
