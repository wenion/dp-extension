import {
  createButton,
} from "../components/button";

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
  createPauseFill,
} from "../components/icons/pauseFill";

import type {
  ActiveSession,
  TabState,
} from "@/shared/types";

import {
  expandPanel,
} from "../message/backgroundClient";

type Props = {
  activeSession?: ActiveSession;
  currentTab?: TabState;

  numberOfRecordingTabs: number;

  onNotice: (
    notice: string,
  ) => void;
};

export function createCollapsed({
  activeSession,
  currentTab,
  numberOfRecordingTabs,
  onNotice,
}: Props): HTMLElement {
  const container =
    document.createElement("div");

  container.className =
    "flex items-center justify-center";

  const handleExpandPanel =
    async () => {
      try {
        await expandPanel();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const captureStatus =
    activeSession?.captureState === "recording"
      ? createCircleFill()
      : createPauseFill();

  captureStatus.classList.add(
    activeSession?.captureState === "recording"
      ? "text-red-600"
      : "text-amber-700",
  );

  let scope: SVGSVGElement;

  switch (currentTab?.recordingScope) {
    case "recording":
      scope = createEye();
      break;

    case "excluded":
      scope = createEyeClosed();
      break;

    default:
      scope = createEyeSlash();
      break;
  }

  /*
   * Tab count
   */

  const tabCount =
    document.createElement("span");

  tabCount.textContent =
    String(numberOfRecordingTabs);

  /*
   * Button
   */

  const button =
    createButton({
      className:
        "gap-4 bg-white hover:bg-gray-50 active:bg-gray-100 shadow-md",
      onPress:
        handleExpandPanel,
    });

  button.append(
    captureStatus,
    scope,
    tabCount,
  );

  container.appendChild(
    button,
  );

  return container;
}