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
  createArrowUpFromLine,
} from "../components/icons/arrowUpFromLine";

import {
  cancelSessionExitRequest,
  exitSession,
} from "../message/backgroundClient";

import type {
  ActiveSession,
} from "@/shared/types";

type Props = {
  activeSession?: ActiveSession;
  numberOfRecordingTabs: number;
  onNotice: (
    notice: string,
  ) => void;
};

export function createExitConfirmation({
  activeSession,
  numberOfRecordingTabs,
  onNotice,
}: Props): HTMLElement {
  const getDuration = () => {
    if (!activeSession?.startedAt) {
      return "00:00";
    }

    const totalSeconds = Math.floor(
      (Date.now() - activeSession.startedAt) / 1000,
    );

    const hours = Math.floor(
      totalSeconds / 3600,
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60,
    );

    const seconds =
      totalSeconds % 60;

    if (hours > 0) {
      return [
        hours,
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0"),
      ].join(":");
    }

    return [
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  };

  const handleCancelSessionExitRequest =
    async () => {
      try {
        await cancelSessionExitRequest();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const handleExitSession =
    async () => {
      try {
        await exitSession();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const container =
    document.createElement("div");

  container.className =
    "flex gap-4 items-center";

  const card =
    createCard({
      className: "w-80",
    });

  // Header
  const header =
    createCardHeader({
      className:
        "flex py-2 justify-between items-center",
    });

  const title =
    document.createElement("span");

  title.className =
    "text-lg font-bold";

  title.textContent =
    "Turn off extension?";

  const status =
    document.createElement("div");

  status.className =
    "flex items-center gap-2 text-sm text-gray-500";

  const duration =
    document.createElement("span");

  duration.textContent =
    getDuration();

  const separator =
    document.createElement("span");

  separator.textContent =
    "·";

  const tabs =
    document.createElement("span");

  tabs.textContent =
    numberOfRecordingTabs > 0
      ? `${numberOfRecordingTabs} ${
          numberOfRecordingTabs === 1
            ? "tab"
            : "tabs"
        }`
      : String(numberOfRecordingTabs);

  status.append(
    duration,
    separator,
    tabs,
  );

  header.append(
    title,
    status,
  );

  const body =
    createCardBody({
      className: "px-4 py-0",
    });

  const description =
    document.createElement("p");

  description.className =
    "text-sm";

  description.textContent =
    "Your active session will stop and upload first, then the puck is removed.";

  body.appendChild(
    description,
  );

  const footer =
    createCardFooter({
      className:
        "flex gap-4 justify-between items-center",
    });

  const cancelButton =
    createButton({
      text: "Keep recording",
      className:
        "w-full h-11 px-5 border font-medium",
      onPress:
        handleCancelSessionExitRequest,
    });

  const exitButton =
    createButton({
      text: "Exit & upload",
      startContent:
        createArrowUpFromLine(),
      className:
        "w-full px-0 h-11 border bg-red-700 text-white font-medium hover:bg-red-500",
      onPress:
        handleExitSession,
    });

  footer.append(
    cancelButton,
    exitButton,
  );

  card.append(
    header,
    body,
    footer,
  );

  container.appendChild(
    card,
  );

  return container;
}