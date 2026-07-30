import type { SessionService } from "../services/SessionService";
import type { TabService } from "../services/TabService";
import type { TraceService } from "../services/TraceService";

import type { UserEvent } from "@/shared/types";

export class CaptureController {

  private sessionService: SessionService;
  private tabService: TabService;
  private traceService: TraceService;

  constructor(
    sessionService: SessionService,
    tabService: TabService,
    traceService: TraceService,
  ) {
    this.sessionService = sessionService;
    this.tabService = tabService;
    this.traceService = traceService;
  }

  async capture(trace: UserEvent, tabId: number) {
    const session =
      this.sessionService.getActiveSession();

    // session paused
    if (
      !session ||
      session.captureState === "paused"
    ) {
      return;
    }

    // tab not in scope
    const tabState =
      this.tabService.getTab(tabId);

    if (
      !tabState ||
      tabState.recordingScope !== "recording"
    ) {
      return;
    }

    await this.traceService.add(trace, {
      sessionId: session!.clientId,
      sessionStart: session!.startedAt,
      sessionEnd: session!.endedAt,
      tabId: tabState!.tabId,
      windowId: tabState!.windowId,
      url: tabState!.url,
    });
  }

  async captureMany(traces: UserEvent[], tabId: number) {
    const session =
      this.sessionService.getActiveSession();

    // session paused
    if (
      !session ||
      session.captureState === "paused"
    ) {
      return;
    }

    // tab not in scope
    const tabState =
      this.tabService.getTab(tabId);

    if (
      !tabState ||
      tabState.recordingScope !== "recording"
    ) {
      return;
    }

    await this.traceService.addMany(traces, {
      sessionId: session!.clientId,
      sessionStart: session!.startedAt,
      sessionEnd: session!.endedAt,
      tabId: tabState!.tabId,
      windowId: tabState!.windowId,
      url: tabState!.url,
    });
  }
}
