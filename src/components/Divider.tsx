import type {
  HTMLAttributes,
} from "react";

type DividerProps =
  HTMLAttributes<HTMLHRElement>;

export function Divider({
  className = "",
  ...props
}: DividerProps) {
  return (
    <hr
      className={`
        h-px
        w-full
        border-0
        bg-gray-200
        ${className}
      `}
      {...props}
    />
  );
}