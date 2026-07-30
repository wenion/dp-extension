import { OAuthApi } from "../api/OAuthApi";
import { AuthRepository } from "../repositories/AuthRepository";

import { MissingRefreshTokenError } from "../network/errors/MissingRefreshTokenError";

/**
 * Provides OAuth token operations for authenticated HTTP requests.
 * 
 * This service is intended for infrastructure components (such as
 * AuthenticatedClient) and should not be used directly by business code.
 *
 * This service is responsible for:
 * - Read the current access token.
 * - Refresh the access token when required.
 * - Persist refreshed tokens.
 *
 * This service does not handle authentication failures. Any exception is
 * propagated to the caller, which is responsible for deciding how to
 * recover (e.g. signing the user out or prompting for login).
 */
export class OAuthService {
  private readonly api: OAuthApi;
  private readonly authRepository: AuthRepository;
  private refreshPromise?: Promise<void>;

  constructor(
    api: OAuthApi,
    authRepository: AuthRepository,
  ) {
    this.api = api;
    this.authRepository = authRepository;
  }

  /**
   * Returns the current access token, if available.
   *
   * This method performs no validation or refresh. It simply returns the
   * currently stored access token.
   *
   * Intended to be used only by AuthenticatedClient.
   */
  getAccessToken(): string | undefined {
    return this.authRepository.getAccessToken();
  }

  /**
   * Clears all stored OAuth tokens.
   */
  clearTokens(): Promise<void> {
    return this.authRepository.clear();
  }

  /**
   * Refreshes the current access token.
   *
   * Concurrent callers share the same refresh operation to prevent multiple
   * refresh requests from being sent simultaneously.
   *
   * This method propagates any exception from the refresh operation.
   * Callers are responsible for deciding how authentication failures
   * should be handled (for example, signing the user out or prompting
   * the user to log in again).
   *
   * Intended to be used only by {@link AuthenticatedClient}.
   *
   * @throws MissingRefreshTokenError
   *   If no refresh token is available.
   * @throws HttpError
   *   If the refresh request fails.
   * @throws NetworkError
   *   If the refresh request cannot reach the server.
   */
  async refresh(): Promise<void> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.doRefresh()
        .finally(() => {
          this.refreshPromise = undefined;
        });
    }

    return this.refreshPromise;
  }

  /**
   * Performs the actual refresh request.
   *
   * Assumes the caller is responsible for refresh deduplication.
   */
  private async doRefresh() {
    const refreshToken =
      this.authRepository.getRefreshToken();

    if (!refreshToken) {
      throw new MissingRefreshTokenError();
    }

    const tokens =
      await this.api.refresh(refreshToken);

    await this.authRepository.setTokens(tokens);
  }
}
