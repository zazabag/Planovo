import { ArrowUpRight } from "lucide-react";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "light" | "text";
  arrow?: boolean;
};

export function ButtonLink({
  children,
  variant = "primary",
  arrow = true,
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={`button-link button-link--${variant} ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      {arrow ? <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.8} /> : null}
    </a>
  );
}
