import type { ActiveSessionService } from "../services/ActiveSessionService";
import type { TabsService } from "../services/TabsService";
import type { TraceService } from "../services/TraceService";

import type { UserEvent } from "@/shared/types";

export class CaptureController {

  private activeSessionService: ActiveSessionService;
  private tabsService: TabsService;
  private traceService: TraceService;

  constructor(
    activeSessionService: ActiveSessionService,
    tabsService: TabsService,
    traceService: TraceService,
  ) {
    this.activeSessionService = activeSessionService;
    this.tabsService = tabsService;
    this.traceService = traceService;
  }

  async capture(
    trace: UserEvent,
    tabId: number,
    options?: {
      ignoreRecordingScope?: boolean;
    },
  ) {
    const session =
      this.activeSessionService.getActiveSession();

    // session paused
    if (
      !session ||
      session.captureState === "paused"
    ) {
      return;
    }

    // tab not in scope
    const tabState =
      this.tabsService.getTab(tabId);

    if (!tabState) {
      return;
    }

    if (
      !options?.ignoreRecordingScope &&
      tabState.recordingScope !== "recording"
    ) {
      return;
    }

    await this.traceService.add(trace, {
      sessionId: session.clientId,
      sessionStart: session.startedAt,
      sessionEnd: session.endedAt,
      tabId: tabState.tabId,
      windowId: tabState.windowId,
      url: tabState.url,
    });
  }

  async captureMany(traces: UserEvent[], tabId: number) {
    const session =
      this.activeSessionService.getActiveSession();

    // session paused
    if (
      !session ||
      session.captureState === "paused"
    ) {
      return;
    }

    // tab not in scope
    const tabState =
      this.tabsService.getTab(tabId);

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
