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
  createTriangleExclamation,
} from "../components/icons/triangleExclamation";

import {
  completeUploadFailedSession,
} from "../message/backgroundClient";

type Props = {
  onNotice: (
    notice: string,
  ) => void;
};

export function createUploadFailed({
  onNotice,
}: Props): HTMLElement {
  const handleCompleteUploadFailedSession =
    async () => {
      try {
        await completeUploadFailedSession();
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
        "flex-col items-center justify-center gap-2 py-3",
    });

  const icon =
    createTriangleExclamation(36);

  icon.classList.add(
    "text-amber-700",
  );

  const title =
    document.createElement("p");

  title.className =
    "font-bold";

  title.textContent =
    "Upload failed";

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
    "We couldn't upload this session. Your recording has been saved locally and you can retry uploading later.";

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
        handleCompleteUploadFailedSession,
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