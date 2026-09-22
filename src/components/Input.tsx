import type {
  InputHTMLAttributes,
} from "react";

type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  size?: "sm" | "md";
};

export function Input({
  size = "md",
  className = "",
  ...props
}: InputProps) {
  const sizeClass =
    size === "sm"
      ? "h-8 px-3 text-sm"
      : "h-10 px-3 text-sm";

  return (
    <input
      className={`
        w-full
        rounded-xl
        border
        border-solid
        border-gray-300
        bg-transparent
        outline-none
        transition-colors
        placeholder:text-gray-400
        hover:border-gray-400
        focus:border-gray-500
        focus:ring-1
        focus:ring-gray-300
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${sizeClass}
        ${className}
      `}
      {...props}
    />
  );
}