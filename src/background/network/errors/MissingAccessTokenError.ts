// network/errors/MissingAccessTokenError.ts

export class MissingAccessTokenError extends Error {
  constructor() {
    super("Access token is missing.");
    this.name = "MissingAccessTokenError";
  }
}