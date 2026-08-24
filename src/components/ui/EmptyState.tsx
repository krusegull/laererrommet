import type { ReactNode } from "react";
import { Button } from "./Button";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line px-6 py-10 text-center">
      {icon && <div className="text-foreground/30">{icon}</div>}
      <div>
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-foreground/60">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
