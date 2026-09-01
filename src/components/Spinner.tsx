import type {
  HTMLAttributes,
} from "react";

type SpinnerProps =
  HTMLAttributes<HTMLDivElement>;

export function Spinner({
  className = "",
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`
        h-5
        w-5
        animate-spin
        rounded-full
        border-2
        border-gray-200
        border-t-gray-600
        ${className}
      `}
      {...props}
    />
  );
}