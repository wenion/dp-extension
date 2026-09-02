import type {
  DialogState,
} from "../types";

export function createDialog({
  message,
  confirmText = "OK",
  cancelText = "Not now",
  onConfirm,
  onCancel,
}: DialogState): HTMLElement {
  const dialog =
    document.createElement("div");

  dialog.className = `
    fixed left-6 bottom-6
    z-[2147483647]
    w-80
    rounded-[10px]
    border border-gray-300
    bg-white
    p-4
    text-gray-900
    shadow-xl
    pointer-events-auto
  `;

  const messageElement =
    document.createElement("div");

  messageElement.className =
    "mb-4 text-base leading-relaxed";

  messageElement.textContent =
    message;

  const actions =
    document.createElement("div");

  actions.className =
    "flex justify-end gap-2";

  if (onCancel) {
    const cancelButton =
      document.createElement("button");

    cancelButton.type = "button";

    cancelButton.className = `
      rounded-md
      cursor-pointer
      px-[18px] py-1.5
      text-sm text-gray-700
      hover:bg-gray-100
    `;

    cancelButton.textContent =
      cancelText;

    cancelButton.addEventListener(
      "click",
      onCancel,
    );

    actions.appendChild(
      cancelButton,
    );
  }

  const confirmButton =
    document.createElement("button");

  confirmButton.type = "button";

  confirmButton.className = `
    rounded-md
    bg-blue-600
    cursor-pointer
    px-[18px] py-1.5
    text-sm text-white
    hover:bg-blue-700
  `;

  confirmButton.textContent =
    confirmText;

  confirmButton.addEventListener(
    "click",
    onConfirm,
  );

  actions.appendChild(
    confirmButton,
  );

  dialog.append(
    messageElement,
    actions,
  );

  return dialog;
}