import { getNextPageState } from "./PageTransition";

import type {
  ContentState,
  OptionsState,
  PageTrigger,
} from "@/shared/types";

import type { ContentScriptClient } from "../../clients/ContentScriptClient";
import type { StateRepository } from "../../repositories/StateRepository";

export class PageService {
  private readonly stateRepository: StateRepository;
  private readonly contentScriptClient: ContentScriptClient;

  constructor(
    stateRepository: StateRepository,
    contentScriptClient: ContentScriptClient,
  ) {
    this.stateRepository = stateRepository;
    this.contentScriptClient = contentScriptClient;
  }

  getState() {
    return this.stateRepository.getState();
  }

  getPageMounted(): boolean | undefined {
    return this.stateRepository.getPageMounted();
  }

  async onSessionStarted() {
    await this.updatePageState("START_SESSION");
  }

  async onSessionEnded() {
    await this.updatePageState("END_SESSION");
  }

  async onSessionFinished() {
    await this.updatePageState("FINISH");
  }

  async onUploadSucceeded() {
    await this.updatePageState("UPLOADED");
  }

  async onForceUploadSucceeded() {
    await this.updatePageState("FORCE_UPLOADED");
  }

  async onUploadFailed() {
    await this.updatePageState("UPLOADFAILED");
  }

  async onExpanded() {
    await this.updatePageState("EXPAND");
  }

  async onCollapsed() {
    await this.updatePageState("COLLAPSE");
  }

  async onStopRequested() {
    await this.updatePageState("STOP");
  }

  async onStopCancelled() {
    await this.updatePageState("BACK");
  }
  
  async onExitRequested() {
    await this.updatePageState("EXIT");
  }

  async onExitCancelled() {
    await this.updatePageState("BACK");
  }

  async onContentConnected(state: ContentState) {
    await this.contentScriptClient.broadcast({
      type: "CONTENT/INITIALIZED",
      payload: state,
    });
  } 

  async onOptionsConnected(state: OptionsState) {
    await this.contentScriptClient.broadcast({
      type: "OPTIONS/INITIALIZED",
      payload: state,
    });
  } 

  async onMounted() {
    await this.stateRepository.setPageMounted(true);
    await this.contentScriptClient.broadcast({
      type: "PAGE/MOUNTED",
    });
  }

  async onUnmounted(tabId?: number) {
    await this.stateRepository.setPageMounted(false);
    await this.contentScriptClient.broadcast({
      type: "PAGE/UNMOUNTED",
      payload: tabId,
    });
  }

  private async updatePageState(trigger: PageTrigger) {
    const current =
      this.stateRepository.getPageState();

    const next =
      getNextPageState(current, trigger);
    
    if (!next) {
      return;
    }

    await this.stateRepository.setPageState(next);

    await this.notifyPageStateUpdated();
  }

  private async notifyPageStateUpdated() {
    await this.contentScriptClient.broadcast({
      type: "PAGE_STATE/UPDATED",
      payload: this.stateRepository.getPageState(),
    });
  }
}
