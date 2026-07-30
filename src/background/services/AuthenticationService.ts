import { env } from "@/config/env";

import { OAuthApi } from "../api/OAuthApi";
import { AuthRepository } from "../repositories/AuthRepository";

export class AuthenticationService {
  private readonly api: OAuthApi;
  private readonly authRepository: AuthRepository;

  constructor(
    api: OAuthApi,
    authRepository: AuthRepository,
  ) {
    this.api = api;
    this.authRepository = authRepository;
  }

  isAuthenticated(): boolean {
    return !!this.authRepository.getAccessToken();
  }

  async openLogin() {
    const url = new URL("/login", env.apiUrl);

    url.searchParams.set("from", "extension");
    url.searchParams.set("ext", chrome.runtime.id);

    chrome.tabs.create({ url: url.href });
  }
 
  async completeLogin(code: string) {
    const tokens = await this.api.exchange(code);

    await this.authRepository.setTokens(tokens);
  }

  async signOut() {
    await this.authRepository.clear();
  }
}
