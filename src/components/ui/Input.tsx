import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            "w-full rounded-button border border-line bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40",
            "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            error && "border-error focus:border-error focus:ring-error/20",
            className
          )}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-sm text-error">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-sm text-foreground/60">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
