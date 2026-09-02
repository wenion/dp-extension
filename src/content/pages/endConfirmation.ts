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
  createSquareFill,
} from "../components/icons/squareFill";

import {
  cancelSessionEndRequest,
  endSession,
} from "../message/backgroundClient";

type Props = {
  onNotice: (
    notice: string,
  ) => void;
};

export function createEndConfirmation({
  onNotice,
}: Props): HTMLElement {
  const handleCancelSessionEndRequest =
    async () => {
      try {
        await cancelSessionEndRequest();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const handleEndSession =
    async () => {
      try {
        await endSession();
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
    "End session?";

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
    "Recording stops and the session uploads to the database.";

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
      className:
        "w-full h-11 px-5 border font-medium",
      onPress:
        handleCancelSessionEndRequest,
    });

  const endButton =
    createButton({
      text: "End & upload",
      startContent:
        createSquareFill(),
      className:
        "w-full h-11 px-5 border border-rose-200 text-red-600 font-medium",
      onPress:
        handleEndSession,
    });

  footer.append(
    cancelButton,
    endButton,
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