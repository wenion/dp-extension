import {
  createCard,
  createCardBody,
  createCardHeader,
} from "../components/card";

import {
  createSpinner,
} from "../components/spinner";

export function createUploading(): HTMLElement {
  const container =
    document.createElement("div");

  container.className =
    "flex gap-4 items-center";

  const card =
    createCard({
      className: "p-2",
    });

  /*
   * Header
   */

  const header =
    createCardHeader({
      className:
        "gap-x-4 justify-center",
    });

  const spinner =
    createSpinner();

  header.appendChild(
    spinner,
  );

  /*
   * Body
   */

  const body =
    createCardBody();

  const content =
    document.createElement("div");

  content.className =
    "flex flex-col items-center justify-center";

  const title =
    document.createElement("p");

  title.className =
    "font-bold";

  title.textContent =
    "Uploading session...";

  const description =
    document.createElement("span");

  description.className =
    "text-sm";

  description.textContent =
    "Pushing events to the database.";

  content.append(
    title,
    description,
  );

  body.appendChild(
    content,
  );

  /*
   * Assemble
   */

  card.append(
    header,
    body,
  );

  container.appendChild(
    card,
  );

  return container;
}