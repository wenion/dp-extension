import type { ActiveSessionService } from "../services/ActiveSessionService";
import type { GoogleDocsService } from "../services/GoogleDocsService";
import type { TabsService } from "../services/TabsService";
import type { TraceService } from "../services/TraceService";

import type {
  GoogleDocsMeta,
  UserEvent,
} from "@/shared/types";

export class CaptureController {

  private readonly activeSessionService: ActiveSessionService;
  private readonly tabsService: TabsService;
  private readonly traceService: TraceService;
  private readonly googleDocsService: GoogleDocsService;

  constructor(
    activeSessionService: ActiveSessionService,
    tabsService: TabsService,
    traceService: TraceService,
    googleDocsService: GoogleDocsService,
  ) {
    this.activeSessionService =
      activeSessionService;
    this.tabsService =
      tabsService;
    this.traceService =
      traceService;
    this.googleDocsService =
      googleDocsService;
  }

  async onCaptureStarted(
    tabId: number,
  ): Promise<void> {
    const tab =
      this.tabsService.getTab(
        tabId,
    );

    if (tab && tab.googleDocId) {
      await this.googleDocsService.init(
        tabId,
        tab.googleDocId,
      );
    }
  }

  async onCaptureStopped(
    tabId: number,
  ): Promise<void> {
    await this.googleDocsService.remove(
      tabId,
    );
  }

  async captureGoogleDocs(
    trace: GoogleDocsMeta,
    tabId: number,
  ): Promise<void> {
    const traces =
      await this.googleDocsService.update(
        tabId,
        trace,
      );

    await this.captureMany(
      traces,
      tabId,
    );
  }

  async capture(
    trace: UserEvent,
    tabId: number,
    options?: {
      ignoreRecordingScope?: boolean;
    },
  ): Promise<void> {
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

  async captureMany(
    traces: UserEvent[],
    tabId: number,
  ): Promise<void> {
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
