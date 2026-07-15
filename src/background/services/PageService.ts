import type { Storage } from "../storage/Storage";
import type { ContentScriptClient } from "../clients/ContentScriptClient";
import type { PageTrigger } from "@/shared/types";

export class PageService {
  private readonly storage: Storage;
  private readonly contentScriptClient: ContentScriptClient;

  constructor(
    storage: Storage,
    contentScriptClient: ContentScriptClient,
  ) {
    this.storage = storage;
    this.contentScriptClient = contentScriptClient;
  }

  async onSessionStarted() {
    await this.updatePageState("START_SESSION");
    //TODO update badge
  }

  async onSessionEnded() {
    await this.updatePageState("END_SESSION");
    // TODO update badge
  }

  async onUploadSucceeded() {
    await this.updatePageState("UPLOADED");
  }

  async onUploadFailed() {
    await this.updatePageState("UPLOADFAILED");
  }

  async expand() {
    await this.updatePageState("EXPAND");
  }

  async collapse() {
    await this.updatePageState("COLLAPSE");
  }

  async showStopConfirmation() {
    await this.updatePageState("STOP");
  }

  async cancelStopConfirmation() {
    await this.updatePageState("BACK");
  }
  
  async onFinish() {
    await this.updatePageState("FINISH");
  }

  async showExitConfirmation() {
    await this.updatePageState("EXIT");
  }

  async cancelExitConfirmation() {
    await this.updatePageState("BACK");
  }

  async showError() {
    // TODO
  }

  private async updatePageState(trigger: PageTrigger) {
    const pageState = this.storage.getPageState();

    switch (trigger) {
      case "START_SESSION":
        if (!pageState || pageState === "idle") {
          await this.storage.setPageState("collapsed");
        }
        break;
      case "UPLOAD":
      case "END_SESSION":
        if (pageState === "confirm" || pageState === "alert" ) {
          await this.storage.setPageState("uploading");
        }
        break;
      case "EXPAND":
        if (pageState === "collapsed") {
          await this.storage.setPageState("expanded");
        }
        break;
      case "COLLAPSE":
        if (pageState === "expanded") {
          await this.storage.setPageState("collapsed");
        }
        break;
      case "STOP":
        if (pageState === "expanded" || pageState === "collapsed") {
          await this.storage.setPageState("confirm");
        }
        break;
      case "BACK":
        if (pageState === "confirm" || pageState === "alert") {
          await this.storage.setPageState("expanded");
        }
        break;
      case "UPLOADED":
        if (pageState === "uploading") {
          await this.storage.setPageState("uploaded");
        }
        break;
      case "UPLOADFAILED":
        if (pageState === "uploading") {
          await this.storage.setPageState("uploadFailed");
        }
        break;
      case "FINISH":
        if (pageState === "uploaded" || pageState === "uploadFailed") {
          await this.storage.setPageState("idle");
        }
        break;
      case "EXIT":
        switch (pageState) {
          case "collapsed":
          case "expanded":
          case "confirm":
            await this.storage.setPageState("alert");
            break;

          case "uploaded":
          case "uploadFailed":
            await this.storage.setPageState("idle");
            break;
        }
        break;
    }

    this.contentScriptClient.broadcast({
      type: "PAGE_STATE/UPDATED",
      payload: this.storage.getPageState(),
    });
  }
}
