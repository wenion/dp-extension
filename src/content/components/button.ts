type ButtonSize =
  | "sm"
  | "md";

type ButtonOptions = {
  text?: string;

  startContent?: Node;
  endContent?: Node;

  isIconOnly?: boolean;

  size?: ButtonSize;

  className?: string;

  onPress?: (
    event: MouseEvent,
  ) => void | Promise<void>;
};

export function createButton({
  text,
  startContent,
  endContent,
  isIconOnly = false,
  size = "md",
  className = "",
  onPress,
}: ButtonOptions = {}): HTMLButtonElement {
  const button =
    document.createElement("button");

  button.type =
    "button";

  const sizeClass =
    size === "sm"
      ? isIconOnly
        ? "h-8 w-8 min-w-8 p-0"
        : "h-8 min-w-16 px-3 text-sm"
      : isIconOnly
        ? "h-10 w-10 min-w-10 p-0"
        : "h-10 min-w-20 px-4 text-sm";

  button.className = `
    inline-flex
    items-center
    justify-center
    gap-2
    cursor-pointer
    rounded-xl
    border
    border-solid
    border-gray-300
    bg-transparent
    transition-colors
    hover:bg-gray-100
    active:bg-gray-200
    ${sizeClass}
    ${className}
  `;

  if (startContent) {
    button.appendChild(
      startContent,
    );
  }

  if (text) {
    button.append(
      document.createTextNode(
        text,
      ),
    );
  }

  if (endContent) {
    button.appendChild(
      endContent,
    );
  }

  if (onPress) {
    button.addEventListener(
      "click",
      (event) => {
        void onPress(event);
      },
    );
  }

  return button;
}