import type {
  BackgroundEvent,
} from "@/shared/messaging/backgroundProtocol";

import type {
  DialogState,
  OverlayState,
} from "../types";

import {
  getCurrentTab,
  getNumberOfRecordingTabs,
  getPage,
} from "./state";

import {
  createIdle,
} from "../pages/idle";

import {
  createCollapsed,
} from "../pages/collapsed";

import {
  createExpanded,
} from "../pages/expanded";

import {
  createNotice,
} from "../pages/notice";

import {
  createEndConfirmation,
} from "../pages/endConfirmation";

import {
  createExitConfirmation,
} from "../pages/exitConfirmation";

import {
  createUploading,
} from "../pages/uploading";

import {
  createUploadCompleted,
} from "../pages/uploadCompleted";

import {
  createUploadFailed,
} from "../pages/uploadFailed";

import {
  createDialog,
} from "./dialog";

import {
  makeDraggable,
} from "./draggable";


export class OverlayController {
  private state: OverlayState;
  private dialog?: DialogState;

  private readonly draggable:
    HTMLDivElement;

  private readonly pageContainer:
    HTMLDivElement;

  private readonly dialogContainer:
    HTMLDivElement;

  private readonly destroyDraggable:
    () => void;


  constructor(
    container: HTMLElement,
    initialState?: OverlayState,
  ) {
    this.state = {
      ...initialState,
    };

    this.draggable =
      document.createElement("div");

    this.pageContainer =
      document.createElement("div");

    this.dialogContainer =
      document.createElement("div");

    this.draggable.appendChild(
      this.pageContainer,
    );

    container.append(
      this.draggable,
      this.dialogContainer,
    );

    this.destroyDraggable =
      makeDraggable(
        this.draggable,
      );

    chrome.runtime.onMessage.addListener(
      this.handleMessage,
    );

    this.renderPage();
    this.renderDialog();
  }


  private handleMessage = (
    message: BackgroundEvent,
  ) => {
    switch (message.type) {
      case "SESSION/UPDATED":
        this.state.activeSession =
          message.payload;

        this.dialog =
          undefined;
        break;

      case "TABS/UPDATED":
        this.state.tabs =
          message.payload;
        break;

      case "NOTICE/SHOW":
        this.state.notice =
          message.payload;

        this.dialog =
          undefined;
        break;

      default:
        return;
    }

    this.renderPage();
    this.renderDialog();
  };


  private showNotice = (
    notice: string,
  ) => {
    this.state.notice =
      notice;

    this.renderPage();
  };


  private showDialog = (
    dialog: DialogState,
  ) => {
    this.dialog =
      dialog;

    this.renderDialog();
  };


  private hideDialog = () => {
    this.dialog =
      undefined;

    this.renderDialog();
  };


  private renderPage() {
    const page =
      getPage(
        this.state,
      );

    const currentTab =
      getCurrentTab(
        this.state,
      );

    const numberOfRecordingTabs =
      getNumberOfRecordingTabs(
        this.state,
      );

    let element: HTMLElement;

    switch (page) {
      case "idle":
        element =
          createIdle({
            onNotice:
              this.showNotice,
          });
        break;

      case "notice":
        element =
          createNotice({
            message:
              this.state.notice,
          });
        break;

      case "collapsed":
        element =
          createCollapsed({
            activeSession:
              this.state.activeSession,

            currentTab,

            numberOfRecordingTabs,

            onNotice:
              this.showNotice,
          });
        break;

      case "expanded":
        element =
          createExpanded({
            activeSession:
              this.state.activeSession,

            currentTab,

            numberOfRecordingTabs,

            onNotice:
              this.showNotice,

            onShowDialog:
              this.showDialog,

            onHideDialog:
              this.hideDialog,
          });
        break;

      case "end":
        element =
          createEndConfirmation({
            onNotice:
              this.showNotice,
          });
        break;

      case "exit":
        element =
          createExitConfirmation({
            onNotice:
              this.showNotice,
          });
        break;

      case "uploading":
        element =
          createUploading();
        break;

      case "uploaded":
        element =
          createUploadCompleted({
            onNotice:
              this.showNotice,
          });
        break;

      case "failed":
        element =
          createUploadFailed({
            onNotice:
              this.showNotice,
          });
        break;

      default:
        element =
          createIdle({
            onNotice:
              this.showNotice,
          });
    }

    this.pageContainer.replaceChildren(
      element,
    );
  }


  private renderDialog() {
    this.dialogContainer.replaceChildren();

    if (!this.dialog) {
      return;
    }

    this.dialogContainer.appendChild(
      createDialog(
        this.dialog,
      ),
    );
  }


  destroy() {
    chrome.runtime.onMessage.removeListener(
      this.handleMessage,
    );

    this.destroyDraggable();

    this.draggable.remove();
    this.dialogContainer.remove();
  }
}