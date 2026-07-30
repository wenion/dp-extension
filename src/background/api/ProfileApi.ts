import type { Profile } from "@/shared/types";

import type { AuthenticatedClient } from "../network/AuthenticatedClient";

export class ProfileApi {
  private readonly http: AuthenticatedClient;

  constructor(http: AuthenticatedClient) {
    this.http = http;
  }

  get() {
    return this.http.get<Profile>("/api/profile");
  }
}