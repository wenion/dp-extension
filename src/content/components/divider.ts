type DividerOptions = {
  className?: string;
};

export function createDivider({
  className = "",
}: DividerOptions = {}): HTMLHRElement {
  const divider =
    document.createElement("hr");

  divider.className = `
    h-px
    w-full
    border-0
    bg-gray-200
    ${className}
  `;

  return divider;
}