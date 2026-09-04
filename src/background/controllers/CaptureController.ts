import type { ActiveSessionService } from "../services/ActiveSessionService";
import type { GoogleDocsService } from "../services/GoogleDocsService";
import type { TabsService } from "../services/TabsService";
import type { TraceService } from "../services/TraceService";

import type {
  GoogleDocsMeta,
  TabState,
  UserEvent,
} from "@/shared/types";

type MutationCaptureState = {
  isActive: boolean;
  lastActivityAt?: number;
};

const MUTATION_TIMEOUT =
  120_000;

export class CaptureController {
  private readonly mutationCaptureStates =
    new Map<number, MutationCaptureState>();

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
    this.mutationCaptureStates.delete(
      tabId,
    );

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

    if (
      !this.shouldCaptureMutation(
        tabId,
        trace,
        tabState,
      )
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

  private async captureMany(
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

  private shouldCaptureMutation(
    tabId: number,
    trace: UserEvent,
    tabState: TabState,
  ): boolean {
    let state =
      this.mutationCaptureStates.get(
        tabId,
      );

    const timestamp =
      trace.timestamp;

    if (
      state?.lastActivityAt !== undefined &&
      timestamp - state.lastActivityAt >
        MUTATION_TIMEOUT
    ) {
      this.mutationCaptureStates.delete(
        tabId,
      );

      state = undefined;
    }

    // Start trace
    if (this.isStartTrace(trace, tabState)) {
      this.mutationCaptureStates.set(
        tabId,
        {
          isActive: true,
          lastActivityAt: timestamp,
        },
      );

      return true;
    }

    // Mutation trace
    if (this.isMutationTrace(trace)) {
      if (!state?.isActive) {
        return false;
      }

      state.lastActivityAt =
        timestamp;

      return true;
    }

    // Other traces
    return true;
  }

  private isStartTrace(
    trace: UserEvent,
    tabState: TabState,
  ): boolean {
    const isClaude =
      tabState.origin ===
      "https://claude.ai";

    if (
      trace.eventType === "pointerdown"
    ) {
      return (
        trace.elementType === "submit" ||
        isClaude
      );
    }

    if (
      trace.eventType === "keydown"
    ) {
      return true;
    }

    return false;
  }

  private isMutationTrace(
    trace: UserEvent,
  ): boolean {
    return (
      trace.eventType === "mutation"
    );
  }
}
