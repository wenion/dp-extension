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
  createPauseFill,
} from "../components/icons/pauseFill";

import {
  createSquareFill,
} from "../components/icons/squareFill";

import {
  cancelSessionExitRequest,
  exitSession,
} from "../message/backgroundClient";

type Props = {
  onNotice: (
    notice: string,
  ) => void;
};

export function createExitConfirmation({
  onNotice,
}: Props): HTMLElement {
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

  const header =
    createCardHeader({
      className: "flex py-2",
    });

  const title =
    document.createElement("span");

  title.className =
    "text-lg font-bold";

  title.textContent =
    "Turn off extension?";

  header.appendChild(
    title,
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
      text: "Cancel",
      startContent:
        createPauseFill(),
      className:
        "w-full h-11 px-5 border font-medium",
      onPress:
        handleCancelSessionExitRequest,
    });

  const exitButton =
    createButton({
      text: "Turn off & upload",
      startContent:
        createSquareFill(),
      className:
        "w-full px-0 h-11 border bg-red-600 text-white font-medium hover:bg-rose-200",
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