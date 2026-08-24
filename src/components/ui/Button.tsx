import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { LoadingSpinner } from "./LoadingSpinner";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover disabled:hover:bg-primary",
  secondary:
    "bg-white text-primary border border-line hover:bg-background-subtle",
  danger: "bg-error text-white hover:brightness-90",
  ghost: "bg-transparent text-foreground hover:bg-background-subtle",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading = false, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-button font-medium transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" className={variant === "primary" || variant === "danger" ? "text-white" : undefined} />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
