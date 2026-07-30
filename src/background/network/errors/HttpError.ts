export class HttpError<T = unknown> extends Error {
  readonly status: number;
  readonly data?: T;

  constructor(
    status: number,
    data?: T,
    message?: string,
  ) {
    super(message ?? `HTTP ${status}`);

    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }

}