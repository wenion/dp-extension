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

  canCapture(tabId: number): boolean {

    if (!this.sessionService.isRecording()) {
      return false;
    }

    return this.tabService.isRecording(tabId);
  }

  async capture(trace: UserEvent, tabId: number) {
    if (!this.canCapture(tabId)) return;

    const session =
      this.sessionService.getActiveSession();
    
    const tabState =
      this.tabService.getTab(tabId)!;

    await this.traceService.add(trace, {
      sessionId: session!.clientId,
      sessionStart: session!.startedAt,
      sessionEnd: session!.endedAt,
      tabId: tabState!.tabId,
      windowId: tabState!.windowId,
      url: tabState!.url,
      });
  }

}
