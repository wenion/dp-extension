import type { Session } from "@/shared/types";

export class SessionsRepository {
  private sessions = new Map<string, Session>();

  initialize(sessions: readonly Session[]) {
    this.sessions = new Map(
      sessions.map(session => [
        session.clientId,
        session
      ]),
    );
  }

  getSession(clientId: string): Session | undefined {
    return this.sessions.get(clientId);
  }

  getSessions(): readonly Session[] {
    return [...this.sessions.values()]
      .sort((a, b) => b.startedAt - a.startedAt);
  }

  setSession(session: Session) {
    this.sessions.set(session.clientId, session);
  }

  setSessions(sessions: readonly Session[]) {
    this.sessions = new Map(
      sessions.map(session => [session.clientId, session])
    );
  }

  removeSession(clientId: string): boolean {
    return this.sessions.delete(clientId);
  }

  clear() {
    this.sessions.clear();
  }
}