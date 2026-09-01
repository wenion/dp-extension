import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  startContent?: ReactNode;
  endContent?: ReactNode;
  isIconOnly?: boolean;
  size?: "sm" | "md";
  variant?: "bordered";
  color?: "default";
  onPress?: () => void | Promise<void>;
};

export function Button({
  children,
  startContent,
  endContent,
  isIconOnly = false,
  size = "md",
  className = "",
  onPress,
  ...props
}: ButtonProps) {
  const sizeClass =
    size === "sm"
      ? isIconOnly
        ? "h-8 w-8 min-w-8 p-0"
        : "h-8 min-w-16 px-3 text-sm"
      : isIconOnly
        ? "h-10 w-10 min-w-10 p-0"
        : "h-10 min-w-20 px-4 text-sm";

  return (
    <button
      type="button"
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        cursor-pointer
        rounded-lg
        border
        border-gray-200
        bg-transparent
        transition-colors
        hover:bg-gray-100
        active:bg-gray-200
        ${sizeClass}
        ${className}
      `}
      onClick={onPress}
      {...props}
    >
      {startContent}
      {children}
      {endContent}
    </button>
  );
}