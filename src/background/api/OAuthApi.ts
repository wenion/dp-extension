import type { AuthTokens } from "@/shared/api";

import type { HttpClient } from "../network/HttpClient";

export class OAuthApi {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  exchange(code: string): Promise<AuthTokens> {
    return this.http.post<AuthTokens>(
      "/api/extension/exchange",
      { code },
    );
  }

  refresh(refreshToken: string): Promise<AuthTokens> {
    return this.http.post<AuthTokens>(
      "/api/extension/refresh",
      { refreshToken },
    );
  }
}