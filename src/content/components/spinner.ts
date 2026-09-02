type SpinnerOptions = {
  className?: string;
};

export function createSpinner({
  className = "",
}: SpinnerOptions = {}): HTMLDivElement {
  const spinner =
    document.createElement("div");

  spinner.setAttribute(
    "role",
    "status",
  );

  spinner.setAttribute(
    "aria-label",
    "Loading",
  );

  spinner.className = `
    h-5
    w-5
    animate-spin
    rounded-full
    border-2
    border-gray-200
    border-t-gray-600
    ${className}
  `;

  return spinner;
}