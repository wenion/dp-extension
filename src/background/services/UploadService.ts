import type { TraceProcessor } from "../TraceProcessor";
import type { ApiClient } from "../api/ApiClient";
import type { TraceService } from "./TraceService";


export class UploadService {
  private readonly api: ApiClient;
  private readonly traceService: TraceService;
  private readonly traceProcessor: TraceProcessor;

  constructor(
    api: ApiClient,
    traceService: TraceService,
    traceProcessor: TraceProcessor,
  ) {
    this.api = api;
    this.traceService = traceService;
    this.traceProcessor = traceProcessor;
  }

  async uploadTraces(): Promise<{
    success: boolean;
    domains?: string[];
    error?: string;
  }> {
    try {
      const traces = await this.traceService.stopSession();
      const postTraces = this.traceProcessor.process(traces);

      const domains = this.traceProcessor.extractDomains(postTraces);

      // api
      await this.api.trace.uploadMany(postTraces);

      return {
        success: true,
        domains,
      };

    } catch (error) {
      console.error("Failed to upload traces:", error);

      return {
        success: false,
        error: error instanceof Error
          ? error.message
          : "Unknown error",
      };
    }
  }

  async finishTraces() {
    await this.traceService.completeSession();
  }
}
