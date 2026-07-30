// network/NetworkError.ts

export class NetworkError extends Error {
  readonly cause?: unknown;

  constructor(
    cause?: unknown,
    message = "Network request failed.",
  ) {
    super(message);

    this.name = "NetworkError";
    this.cause = cause;
  }
}

// export class NetworkError extends Error {
//   public readonly cause: unknown;

//   constructor(cause?: unknown) {
//     super("Network request failed.");
//     this.name = "NetworkError";
//     this.cause = cause;
//   }
// }