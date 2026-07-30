// network/errors/MissingAccessTokenError.ts

export class MissingRefreshTokenError extends Error {
  constructor() {
    super("Refresh token is missing.");
    this.name = "MissingRefreshTokenError";
  }
}