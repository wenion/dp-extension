import {
  createButton,
} from "../components/button";

import {
  createTriangleRightFill,
} from "../components/icons/triangleRightFill";

import {
  startSession,
} from "../message/backgroundClient";

type Props = {
  onNotice: (
    notice: string,
  ) => void;
};

export function createIdle({
  onNotice,
}: Props): HTMLElement {
  const container =
    document.createElement("div");

  container.className =
    "flex gap-4 items-center";

  const handleStartSession =
    async () => {
      try {
        await startSession();
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        onNotice(
          `${error.message} Please reload the page.`,
        );
      }
    };

  const button =
    createButton({
      text: "Start session",
      startContent:
        createTriangleRightFill(),
      className:
        "bg-white hover:bg-gray-50 active:bg-gray-100 shadow-md",
      onPress:
        handleStartSession,
    });

  container.appendChild(
    button,
  );

  return container;
}