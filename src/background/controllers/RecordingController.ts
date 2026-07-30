import type { PageService } from "../services/PageService";
import type { SessionService } from "../services/SessionService";
import type { SessionsService } from "../services/SessionsService";
import type { TabService } from "../services/TabService";
import type { TraceService } from "../services/TraceService";

import type { Session } from "@/shared/types";

export class RecordingController {

  private pageService: PageService;
  private sessionService: SessionService;
  private sessionsService: SessionsService;
  private tabService: TabService;
  private traceService: TraceService;

  constructor(
    pageService: PageService,
    sessionService: SessionService,
    sessionsService: SessionsService,
    tabService: TabService,
    traceService: TraceService,
  ) {
    this.pageService = pageService;
    this.sessionService = sessionService;
    this.sessionsService = sessionsService;
    this.tabService = tabService;
    this.traceService = traceService;
  }

  async startRecording() {
    await this.sessionService.create();
    await this.pageService.onSessionStarted();
    await this.tabService.resetExcludedTabs();
  }

  async endRecording() {
    await this.sessionService.end();
    await this.pageService.onSessionEnded();
    
    void this.uploadRecording("end");
  }

  async exitRecording(tabId?: number) {
    await this.sessionService.end();
    await this.pageService.onSessionEnded();

    void this.uploadRecording("exit", tabId);
  }

  async finalizeRecording() {
    await this.sessionService.finalize();
    await this.pageService.onSessionFinished();

    await this.traceService.clearTraces();
  }

  async finalizeRecordingFailed() {
    await this.sessionService.finalize();
    await this.pageService.onSessionFinished();
  }

  private async upload(): Promise<boolean> {
    const session =
      this.sessionService.getActiveSession();

    if (!session) {
      console.error("No active Session")
      return false;
    }

    let result: Session;

    result =
      await this.sessionsService.createSession(session);
    
    if (result.uploadStatus === "failed") {
      return false;
    }

    const traces =
      await this.traceService.getUploadPayload();

    try {
      await this.traceService.uploadTraces(traces);
    } catch {
      return false;
    }

    result =
      await this.sessionsService.updateSession(
        result.clientId,
        {
          ...result,
          uploadStatus: "uploading",
        }
      );

    if (result.uploadStatus === "failed") {
      return false;
    }

    const domains =
      this.traceService.getDomains(traces);

    result =
      await this.sessionsService.updateSession(
        result.clientId,
        {
          ...result,
          urls: domains,
          uploadStatus: "uploaded",
        }
      );

    if (result.uploadStatus === "failed") {
      return false;
    }

    return true;
  }

  private async uploadRecording(
    trigger: "end" | "exit",
    tabId?: number,
  ) {
    const result = await this.upload();

    if (!result) {
      await this.uploadFail();
    } else {
      await this.uploadSuccess();
    }

    if (trigger === "exit") {
      await this.finalizeRecording();
      await this.pageService.onUnmounted(tabId);
    }
  }

  async reuploadRecording(
    sessionId: string,
  ): Promise<Session> {
    let session =
      await this.sessionsService.fetchSession(
        sessionId,
      );

    if (!session) {
      // fallback
      let local =
        this.sessionsService.getSession(sessionId);

      if (!local) {
        local = this.sessionService.getActiveSession();

        if (!local || local.clientId !== sessionId) {
          throw new Error(
            `Session not found: ${sessionId}`,
          );
        }
      }

      session =
        await this.sessionsService.createSession(local);
    }

    const traces =
      await this.traceService.getUploadPayloadById(
        sessionId,
      );

    await this.traceService.uploadTraces(traces);

    session =
      await this.sessionsService.updateSession(
        session.clientId,
        {
          ...session,
          uploadStatus: "uploading",
        }
      );

    if (session.uploadStatus === "failed") {
      throw new Error(
        "Failed to update upload status.",
      );
    }

    const domains =
      this.traceService.getDomains(traces);

    session =
      await this.sessionsService.updateSession(
        session.clientId,
        {
          ...session,
          urls: domains,
          uploadStatus: "uploaded",
        }
      );


    if (session.uploadStatus === "failed") {
      throw new Error(
        "Failed to finalize upload.",
      );
    }

    await this.traceService.clearTracesById(sessionId);

    return session;
  }

  async pauseRecording() {
    await this.sessionService.pause();
  }

  async resumeRecording() {
    await this.sessionService.resume();
  }

  async stopRecording() {
    await this.pageService.onStopRequested();
  }

  async cancelStopRecording() {
    await this.pageService.onStopCancelled();
  }

  async uploadSuccess() {
    await this.sessionService.markUploaded();
    await this.pageService.onUploadSucceeded();
  }

  async uploadSuccessAndExit() {
    await this.sessionService.markUploaded();
    await this.pageService.onForceUploadSucceeded();
  }

  async uploadFail() {
    await this.sessionService.markFailed();
    await this.pageService.onUploadFailed();
  }

  async nameRecording(
    name: string,
  ) {
    await this.sessionService.setName(name);
  }
}
