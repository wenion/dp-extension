import { TraceApi } from "../api/TraceApi";

import type { TraceRepository } from "../repositories/TraceRepository";

import type {
  Trace,
  TraceContext,
  UserEvent,
} from "@/shared/types";

export class TraceService {
  private readonly traceApi: TraceApi;
  private readonly traceRepository: TraceRepository;
  
  constructor(
    traceApi: TraceApi,
    traceRepository: TraceRepository,
  ) {
    this.traceApi = traceApi;
    this.traceRepository = traceRepository;
  }

  async getTracesById(
    sessionId: string,
  ): Promise<Trace[]> {
    return this.traceRepository.getBySession(sessionId);
  }

  async uploadTraces(traces: Trace[]): Promise<{ids: string[]}> {
    return this.traceApi.uploadMany(traces);
  }

  // ===== Repository =====
  async add(trace: UserEvent, context: TraceContext) {
    await this.traceRepository.append({
      ...trace,
      ...context
    });
  }

  async addMany(
    traces: readonly UserEvent[],
    context: TraceContext,
  ): Promise<void> {
    await this.traceRepository.appendMany(
      traces.map(trace => ({
        ...trace,
        ...context,
      })),
    );
  }

  async clearTraces() {
    await this.traceRepository.clear();
  }

  async clearTracesById(
    sessionId: string,
  ): Promise<void> {
    await this.traceRepository.clearBySession(sessionId);
  }
}
