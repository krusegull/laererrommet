import { cn } from "@/lib/cn";

export function LoadingDots({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Laster"
      className={cn("inline-flex items-center gap-1", className)}
    >
      <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
    </span>
  );
}
