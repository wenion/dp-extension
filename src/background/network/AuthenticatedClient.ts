import { HttpClient } from "../network/HttpClient";

import { HttpError } from "./errors/HttpError";
import { MissingAccessTokenError } from "./errors/MissingAccessTokenError";

import { OAuthService } from "../services/OAuthService";

import type { RequestOptions } from "@/shared/api";

/**
 * HTTP client for authenticated requests.
 *
 * Automatically attaches the current access token to every request.
 * If a request fails with HTTP 401, it attempts to refresh the access
 * token once and retries the original request.
 *
 * Authentication failures (for example, missing or expired credentials)
 * are propagated to the caller so the application can decide whether
 * to prompt the user to sign in again.
 *
 * Other HTTP errors (such as 404 or 500) are not handled here and are
 * passed through unchanged.
 */
export class AuthenticatedClient extends HttpClient {
  private readonly oauthService: OAuthService;

  constructor(
    oauthService: OAuthService,
  ) {
    super();
    this.oauthService = oauthService;
  }

  protected override appendHeaders(headers: Headers): void {
    const token = this.oauthService.getAccessToken();

    if (!token) {
      throw new MissingAccessTokenError();
    }

    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  protected override async request<T>(
    options: RequestOptions
  ): Promise<T> {
    try {
      return await super.request<T>(options);
    } catch (error) {
      if (
        !(error instanceof HttpError) ||
        error.status !== 401
      ) {
        throw error;
      }

      try {
        await this.oauthService.refresh();
      } catch (e) {
        console.error(e)
        await this.oauthService.clearTokens();
        throw e;
      }

      return super.request<T>(options);
    }
  }
}
