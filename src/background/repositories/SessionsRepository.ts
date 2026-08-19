import { dbPromise } from "./db/AppDatabase";

import type { Session } from "@/shared/types";

const STORE_NAME = "sessions";

export class SessionsRepository {
  private readonly sessions =
    new Map<string, Session>();

  async initialize(): Promise<void> {
    const db = await dbPromise;
    const storedSessions =
      await db.getAll(STORE_NAME);

    this.sessions.clear();

    for (const session of storedSessions) {
      this.sessions.set(
        session.clientId,
        session,
      );
    }
  }

  // -------------------------
  // Local DB
  // -------------------------

  async getLocal(
    clientId: string,
  ): Promise<Session | undefined> {
    const db = await dbPromise;

    return db.get(
      STORE_NAME,
      clientId,
    );
  }

  private async setLocal(
    session: Session,
  ): Promise<void> {
    const db = await dbPromise;

    await db.put(
      STORE_NAME,
      session,
    );
  }

  private async deleteLocal(
    clientId: string,
  ): Promise<void> {
    const db = await dbPromise;

    await db.delete(
      STORE_NAME,
      clientId,
    );
  }

  // -------------------------
  // Memory
  // -------------------------

  async setSession(
    session: Session,
    persistLocal = false,
  ): Promise<void> {
    if (persistLocal) {
      await this.setLocal(session);
    }

    this.sessions.set(
      session.clientId,
      session,
    );
  }

  async setSessions(
    sessions: readonly Session[],
    persistLocal = false,
  ): Promise<void> {
    if (persistLocal) {
      for (const session of sessions) {
        await this.setLocal(session);
      }
    }

    for (const session of sessions) {
      this.sessions.set(
        session.clientId,
        session,
      );
    }
  }

  async deleteSession(
    clientId: string,
    deleteLocal = false,
  ): Promise<void> {
    if (deleteLocal) {
      await this.deleteLocal(
        clientId,
      );
    }

    this.sessions.delete(
      clientId,
    );
  }

  get(
    clientId: string,
  ): Session | undefined {
    return this.sessions.get(
      clientId,
    );
  }

  getAll(): Session[] {
    return Array.from(
      this.sessions.values(),
    );
  }
}
