import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({ className, header, footer, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-background shadow-card",
        className
      )}
      {...props}
    >
      {header && <div className="border-b border-line px-5 py-4">{header}</div>}
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="border-t border-line px-5 py-4">{footer}</div>}
    </div>
  );
}
