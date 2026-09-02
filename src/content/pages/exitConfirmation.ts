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
      className: "py-2",
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
      className: "p-2",
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
      text: "Ⅱ Cancel",
      className:
        "w-full h-11 px-5 border font-medium",
      onPress:
        handleCancelSessionExitRequest,
    });

  const exitButton =
    createButton({
      text: "■ Turn off & upload",
      className:
        "w-full h-11 px-5 border text-red-600 font-medium",
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