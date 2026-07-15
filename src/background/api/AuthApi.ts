import { HttpClient } from "../network/HttpClient";

export class AuthApi {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  exchange(code: string) {
    return this.http.post<{token: string}>(
      "/api/extension/exchange",
      { code },
      false,
    );
  }
}