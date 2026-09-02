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
  createCircleCheck,
} from "../components/icons/circleCheck";

import {
  completeUploadedSession,
} from "../message/backgroundClient";

type Props = {
  onNotice: (
    notice: string,
  ) => void;
};

export function createUploadCompleted({
  onNotice,
}: Props): HTMLElement {
  const handleCompleteUploadedSession =
    async () => {
      try {
        await completeUploadedSession();
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

  /*
   * Header
   */

  const header =
    createCardHeader({
      className:
        "flex-col items-center justify-center gap-2 py-3 text-green-600",
    });

  const icon =
    createCircleCheck(36);

  icon.classList.add(
    "text-green-600",
  );

  const title =
    document.createElement("p");

  title.className =
    "font-bold";

  title.textContent =
    "Session uploaded";

  header.append(
    icon,
    title,
  );

  /*
   * Body
   */

  const body =
    createCardBody({
      className:
        "py-1 px-4",
    });

  const description =
    document.createElement("p");

  description.className =
    "text-sm text-center";

  description.textContent =
    "All events confirmed. The extension stays on, ready for another session.";

  body.appendChild(
    description,
  );

  /*
   * Footer
   */

  const footer =
    createCardFooter({
      className:
        "justify-center",
    });

  const doneButton =
    createButton({
      text: "Done",
      className: "w-full",
      onPress:
        handleCompleteUploadedSession,
    });

  footer.appendChild(
    doneButton,
  );

  /*
   * Assemble
   */

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