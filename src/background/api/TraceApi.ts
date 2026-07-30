import type { Trace } from "@/shared/types";

import type { AuthenticatedClient } from "../network/AuthenticatedClient";

export class TraceApi {
  private readonly http: AuthenticatedClient;

  constructor(http: AuthenticatedClient) {
    this.http = http;
  }

  upload(trace: Trace) {
    return this.http.post<{ id: string }>(
      "/api/v1/traces",
      trace,
    );
  }

  uploadMany(traces: Trace[]) {
    return this.http.post<{ ids: string[] }>(
      "/api/v1/traces/batch",
      traces,
    );
  }
}