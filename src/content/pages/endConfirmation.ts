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
  createArrowUpToLine,
} from "../components/icons/arrowUpToLine";

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
  let sessionName = "";

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
        await endSession(
          sessionName.trim() || undefined,
        );
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
    "End session?";

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
    "Recording stops and the session uploads to the database.";

  body.appendChild(
    description,
  );

  // Session name field
  const inputContainer =
    document.createElement("div");

  inputContainer.className =
    "mt-2";

  const label =
    document.createElement("label");

  label.htmlFor =
    "session-name";

  label.className =
    "block mb-1 text-sm font-bold";

  label.textContent =
    "Session name";

  const input =
    document.createElement("input");

  input.id =
    "session-name";

  input.type =
    "text";

  input.placeholder =
    "Enter session name";

  input.maxLength =
    100;

  input.className = `
    w-full
    h-10
    px-3
    text-sm
    rounded-xl
    border
    border-solid
    border-gray-300
    bg-transparent
    outline-none
    transition-colors
    placeholder:text-gray-400
    hover:border-gray-400
    focus:border-gray-500
    focus:ring-1
    focus:ring-gray-300
  `;

  input.addEventListener(
    "input",
    () => {
      sessionName =
        input.value;
    },
  );

  inputContainer.append(
    label,
    input,
  );

  body.appendChild(
    inputContainer,
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
        handleCancelSessionEndRequest,
    });

  const endButton =
    createButton({
      text: "End & upload",
      startContent:
        createArrowUpToLine(),
      className:
        "w-full px-0 h-11 border bg-red-600 text-white font-medium hover:bg-rose-200",
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