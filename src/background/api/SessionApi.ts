import type { ListSessionsResponse } from "@/shared/api";
import type { Session } from "@/shared/types";

import { HttpError } from "../network/errors/HttpError";
import type { AuthenticatedClient } from "../network/AuthenticatedClient";


export class SessionApi {
  private readonly http: AuthenticatedClient;

  constructor(http: AuthenticatedClient) {
    this.http = http;
  }

  create(session: Session): Promise<Session> {
    return this.http.post("/api/v1/sessions", session);
  }

  async get(clientId: string): Promise<Session | undefined> {
    try {
      return await this.http.get(
        `/api/v1/sessions/${clientId}`
      );
    } catch (error) {
      if (
        error instanceof HttpError &&
        error.status === 404
      ) {
        return undefined;
      }

      throw error;
    }
  }

  list(limit = 5): Promise<ListSessionsResponse> {
    return this.http.get(`/api/v1/sessions?page=1&pageSize=${limit}`);
  }

  update(
    clientId: string,
    session: Partial<Session>,
  ): Promise<Session> {
    return this.http.post(
      `/api/v1/sessions/${clientId}`,
      session,
    );
  }

}