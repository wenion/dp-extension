import type { AuthTokens } from "@/shared/api";

const STORAGE_KEY = "authTokens";

export class AuthRepository {
  private tokens?: AuthTokens;

  async initialize() {
    const { [STORAGE_KEY]: tokens } =
      await chrome.storage.local.get(STORAGE_KEY);

    this.tokens = tokens as AuthTokens | undefined;
  }

  getAccessToken(): string | undefined {
    return this.tokens?.accessToken;
  }

  getRefreshToken(): string | undefined {
    return this.tokens?.refreshToken;
  }

  getTokens(): Readonly<AuthTokens> | undefined {
    return this.tokens;
  }

  async setTokens(tokens: AuthTokens) {
    this.tokens = tokens;

    await chrome.storage.local.set({
      [STORAGE_KEY]: tokens,
    });
  }

  async clear() {
    this.tokens = undefined;

    await chrome.storage.local.remove(STORAGE_KEY);
  }
}