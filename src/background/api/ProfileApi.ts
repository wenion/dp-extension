import { HttpClient } from "../network/HttpClient";
import type { Profile } from "@/shared/types";

export class ProfileApi {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  get() {
    return this.http.get<Profile>("/api/profile");
  }
}