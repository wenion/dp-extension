import { env } from "@/config/env";

import type { OAuthApi } from "../api/OAuthApi";

import type { AuthRepository } from "../repositories/AuthRepository";

export class AuthenticationService {
  private readonly oauthApi: OAuthApi;
  private readonly authRepository: AuthRepository;

  constructor(
    oauthApi: OAuthApi,
    authRepository: AuthRepository,
  ) {
    this.oauthApi = oauthApi;
    this.authRepository = authRepository;
  }

  async openLogin() {
    const url = new URL("/login", env.apiUrl);

    url.searchParams.set("from", "extension");
    url.searchParams.set("ext", chrome.runtime.id);

    chrome.tabs.create({ url: url.href });
  }

  async completeLogin(code: string) {
    const tokens = await this.oauthApi.exchange(code);

    await this.authRepository.setTokens(tokens);
  }

  isAccessTokenMissing(): boolean {
    return this.authRepository.getAccessToken() === undefined;
  }
}
