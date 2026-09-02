import {
  createCard,
  createCardBody,
  createCardHeader,
} from "../components/card";

import {
  createSpinner,
} from "../components/spinner";

type Props = {
  message?: string;
  loading?: boolean;
};

export function createNotice({
  message,
  loading = false,
}: Props): HTMLElement {
  const card =
    createCard({
      className:
        "w-80 min-h-[169px]",
    });

  if (loading) {
    const header =
      createCardHeader({
        className:
          "justify-center py-2",
      });

    const spinner =
      createSpinner();

    header.appendChild(
      spinner,
    );

    card.appendChild(
      header,
    );
  }

  const body =
    createCardBody({
      className:
        "flex items-center justify-center px-4 py-4",
    });

  const text =
    document.createElement("p");

  text.className =
    "text-center text-lg font-medium";

  text.textContent =
    message ?? "";

  body.appendChild(
    text,
  );

  card.appendChild(
    body,
  );

  return card;
}