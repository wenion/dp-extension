export class MissingActiveSessionError extends Error {
  constructor() {
    super("No active session.");

    this.name = "MissingActiveSessionError";
  }
}
