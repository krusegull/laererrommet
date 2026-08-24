import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "primary" | "success" | "error" | "neutral";

const styles: Record<BadgeVariant, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  error: "bg-error/10 text-error",
  neutral: "bg-background-subtle text-foreground/70",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
