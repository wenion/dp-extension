import {
  createButton,
} from "../components/button";

import {
  createCard,
  createCardBody,
  createCardFooter,
  createCardHeader,
} from "../components/card";

import {
  createDivider,
} from "../components/divider";

import {
  createChevronDown,
} from "../components/icons/chevronDown";

import {
  createCircleFill,
} from "../components/icons/circleFill";

import {
  createEye,
} from "../components/icons/eye";

import {
  createEyeClosed,
} from "../components/icons/eyeClosed";

import {
  createEyeSlash,
} from "../components/icons/eyeSlash";

import {
  createLayoutHeader,
} from "../components/icons/layoutHeader";

import {
  createPauseFill,
} from "../components/icons/pauseFill";

import {
  createPlayFill,
} from "../components/icons/playFill";

import {
  createSquareFill,
} from "../components/icons/squareFill";

import {
  addToAllowlist,
  collapsePanel,
  excludeTab,
  includeTab,
  openOptionsPage,
  pauseSession,
  promptHostPermission,
  resumeSession,
  requestSessionEnd,
} from "../message/backgroundClient";

import type {
  ActiveSession,
  TabState,
} from "@/shared/types";

import type {
  DialogState,
} from "../types";

type Props = {
  activeSession?: ActiveSession;
  currentTab?: TabState;

  numberOfRecordingTabs: number;

  onNotice: (
    notice: string,
  ) => void;

  onShowDialog: (
    dialog: DialogState,
  ) => void;

  onHideDialog: () => void;
};

export function createExpanded({
  activeSession,
  currentTab,
  numberOfRecordingTabs,
  onNotice,
  onShowDialog,
  onHideDialog,
}: Props): HTMLElement {
  const container =
    document.createElement("div");

  container.className =
    "flex items-center";

  const handleAddToAllowlist =
    async () => {
      try {
        await addToAllowlist();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const handleCollapsePanel =
    async () => {
      try {
        await collapsePanel();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const handleExcludeTab =
    async () => {
      try {
        await excludeTab();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const handleIncludeTab =
    async () => {
      try {
        await includeTab();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const handleOpenOptionsPage =
    async () => {
      try {
        await openOptionsPage();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const handlePauseSession =
    async () => {
      try {
        await pauseSession();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const handlePromptHostPermission =
    async () => {
      try {
        await promptHostPermission();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const handleResumeSession =
    async () => {
      try {
        await resumeSession();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const handleRequestEndSession =
    async () => {
      try {
        await requestSessionEnd();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const promptTemporaryPermission =
    async () => {
      if (!currentTab?.url) {
        return;
      }

      const domain =
        new URL(
          currentTab.url,
        ).hostname;

      await handleIncludeTab();

      onShowDialog({
        message:
          `Capturing ${domain} this session. ` +
          "Save to your defaults for next time?",

        confirmText: "Save",
        cancelText: "Not now",

        onConfirm: async () => {
          await handleAddToAllowlist();
          onHideDialog();
        },

        onCancel: onHideDialog,
      });
    };

  /*
   * Card
   */

  const card =
    createCard({
      className: "w-80",
    });

  /*
   * Header
   */

  const header =
    createCardHeader({
      className:
        "py-2 px-4 justify-between items-center",
    });

  const status =
    document.createElement("div");

  status.className =
    activeSession?.captureState === "recording"
      ? "flex gap-x-2 items-center text-red-600"
      : "flex gap-x-2 items-center text-amber-700";

  const statusIcon =
    activeSession?.captureState ===
    "recording"
      ? createCircleFill()
      : createPauseFill();

  const statusText =
    document.createElement("p");

  statusText.textContent =
    activeSession?.captureState === "recording"
      ? "Recording"
      : "Paused";

  status.append(
    statusIcon,
    statusText,
  );

  const headerActions =
    document.createElement("div");

  headerActions.className =
    "flex gap-x-2 items-center";

  const tabsButton =
    createButton({
      text:
        String(numberOfRecordingTabs),
      startContent:
        createLayoutHeader(),
      size: "sm",
      onPress:
        handleOpenOptionsPage,
    });

  const collapseButton =
    createButton({
      startContent:
        createChevronDown(),
      size: "sm",
      isIconOnly: true,
      onPress:
        handleCollapsePanel,
    });

  headerActions.append(
    tabsButton,
    collapseButton,
  );

  header.append(
    status,
    headerActions,
  );

  /*
   * Body
   */

  const body =
    createCardBody({
      className:
        "pb-4 px-4",
    });

  const sessionActions =
    document.createElement("div");

  sessionActions.className =
    "flex gap-x-4";

  const isRecording =
    activeSession?.captureState ===
    "recording";

  const pauseResumeButton =
    createButton({
      text:
        isRecording
          ? "Pause"
          : "Resume",

      startContent:
        isRecording
          ? createPauseFill()
          : createPlayFill(),

      className:
        "w-full border border-amber-400 text-amber-700 font-medium",

      onPress:
        isRecording
          ? handlePauseSession
          : handleResumeSession,
    });

  const stopButton =
    createButton({
      text: "Stop",

      startContent:
        createSquareFill(),

      className:
        "w-full border border-rose-200 text-red-600 font-medium",

      onPress:
        handleRequestEndSession,
    });

  sessionActions.append(
    pauseResumeButton,
    stopButton,
  );

  body.appendChild(
    sessionActions,
  );

  if (
    !activeSession ||
    activeSession.captureState ===
      "paused"
  ) {
    const warning =
      document.createElement("p");

    warning.className =
      "pt-2 text-sm text-amber-700";

    warning.textContent =
      "Capture suspended — no events recorded while paused.";

    body.appendChild(
      warning,
    );
  }

  /*
   * Divider
   */

  const divider =
    createDivider();

  /*
   * Footer
   */

  const footer =
    createCardFooter({
      className:
        "py-2 px-4",
    });

  const tabAction =
    document.createElement("div");

  tabAction.className =
    "flex gap-x-4 items-center";

  const scopeText =
    document.createElement("span");

  let actionText =
    "this URL is not supported";

  let actionClassName =
    "text-gray-500";

  let scopeIcon:
    SVGSVGElement =
      createEyeSlash();

  let handleScopePress:
    (() => void | Promise<void>) |
    undefined;

  if (
    currentTab?.recordingScope ===
    "recording"
  ) {
    scopeIcon =
      createEye();

    actionText =
      activeSession?.captureState ===
      "recording"
        ? "recording"
        : "paused";

    actionClassName =
      activeSession?.captureState ===
      "recording"
        ? "text-red-600"
        : "text-amber-700";

    handleScopePress =
      handleExcludeTab;
  } else if (
    currentTab?.recordingScope ===
    "excluded"
  ) {
    scopeIcon =
      createEyeClosed();

    actionText =
      "excluded";

    handleScopePress =
      handleIncludeTab;
  } else if (
    currentTab?.recordingScope ===
    "not_in_scope"
  ) {
    scopeIcon =
      createEyeSlash();

    actionText =
      "not in scope";

    handleScopePress =
      promptTemporaryPermission;
  } else if (
    currentTab?.recordingScope ===
    "no_permission"
  ) {
    scopeIcon =
      createEyeSlash();

    actionText =
      "not in scope";

    handleScopePress =
      handlePromptHostPermission;
  }

  const scopeButton =
    createButton({
      startContent:
        scopeIcon,
      isIconOnly: true,
      size: "sm",
      className:
        actionClassName,
      onPress:
        handleScopePress,
    });

  scopeText.append(
    "This tab · ",
  );

  const actionStatus =
    document.createElement("span");

  actionStatus.className =
    `${actionClassName} font-medium`;

  actionStatus.textContent =
    actionText;

  scopeText.appendChild(
    actionStatus,
  );

  tabAction.append(
    scopeButton,
    scopeText,
  );

  footer.appendChild(
    tabAction,
  );

  /*
   * Assemble
   */

  card.append(
    header,
    body,
    divider,
    footer,
  );

  container.appendChild(
    card,
  );

  return container;
}