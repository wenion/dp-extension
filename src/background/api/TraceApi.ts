import { HttpClient } from "../network/HttpClient";
import type { Trace } from "@/shared/types";

export class TraceApi {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  upload(trace: Trace) {
    return this.http.post<{id: string}>(
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