import { TraceApi } from "../api/TraceApi";

import type { TraceRepository } from "../repositories/TraceRepository";
import type { TraceProcessor } from "../TraceProcessor";

import type {
  Trace,
  TraceContext,
  UserEvent,
} from "@/shared/types";

export class TraceService {
  private readonly traceApi: TraceApi;
  private readonly traceRepository: TraceRepository;
  private readonly traceProcessor: TraceProcessor;
  
  constructor(
    traceApi: TraceApi,
    traceRepository: TraceRepository,
    traceProcessor: TraceProcessor,
  ) {
    this.traceApi = traceApi;
    this.traceRepository = traceRepository;
    this.traceProcessor = traceProcessor;
  }

  async getUploadPayload(): Promise<Trace[]> {
    const traces = await this.traceRepository.getAll();
    const orderedTraces = this.traceProcessor.assignSequence(traces);

    const postTraces = this.traceProcessor.process(orderedTraces);

    return postTraces;
  }

  async getUploadPayloadById(
    sessionId: string,
  ): Promise<Trace[]> {
    const traces =
      await this.traceRepository.getBySession(sessionId);

    const ordered =
      this.traceProcessor.assignSequence(traces);

    return this.traceProcessor.process(ordered);
  }

  getDomains(traces: Trace[]): string[] {
    return this.traceProcessor.extractDomains(traces);
  }

  async uploadTraces(traces: Trace[]) {
    return this.traceApi.uploadMany(traces);
  }

  async clearTraces() {
    await this.traceRepository.clear();
  }

  async clearTracesById(
    sessionId: string,
  ): Promise<void> {
    await this.traceRepository.clearBySession(sessionId);
  }

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
}
