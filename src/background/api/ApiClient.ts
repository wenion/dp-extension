// api/index.ts
import { HttpClient } from "../network/HttpClient";
import { AuthApi } from "./AuthApi";
import { ProfileApi } from "./ProfileApi";
import { SessionApi } from "./SessionApi";
import { TraceApi } from "./TraceApi";

export class ApiClient {
  readonly profile: ProfileApi;
  readonly auth: AuthApi;
  readonly trace: TraceApi;
  readonly session: SessionApi;

  constructor(http: HttpClient) {
    this.profile = new ProfileApi(http);
    this.auth = new AuthApi(http);
    this.trace = new TraceApi(http);
    this.session = new SessionApi(http);
  }
}