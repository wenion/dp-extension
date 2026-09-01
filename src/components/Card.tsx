import type {
  HTMLAttributes,
  ReactNode,
} from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  shadow?: "none";
};

export function Card({
  children,
  className = "",
  shadow: _shadow,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        relative
        flex
        flex-col
        overflow-hidden
        rounded-xl
        bg-white
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`
        flex
        p-3
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`
        relative
        flex-auto
        p-3
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`
        flex
        p-3
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}