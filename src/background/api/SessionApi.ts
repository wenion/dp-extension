import type { ListSessionsResponse } from "@/shared/api";
import type { Session } from "@/shared/types";

import type { AuthenticatedClient } from "../network/AuthenticatedClient";


export class SessionApi {
  private readonly http: AuthenticatedClient;

  constructor(http: AuthenticatedClient) {
    this.http = http;
  }

  create(session: Session): Promise<Session> {
    return this.http.post("/api/v1/sessions", session);
  }

  get(clientId: string): Promise<Session> {
    return this.http.get(`/api/v1/sessions/${clientId}`);
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