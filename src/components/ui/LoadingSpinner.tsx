import { cn } from "@/lib/cn";

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-9 w-9 border-[3px]",
};

export function LoadingSpinner({
  size = "md",
  className,
}: {
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Laster"
      className={cn(
        "inline-block animate-spin rounded-full border-current border-t-transparent text-primary",
        sizeMap[size],
        className
      )}
    />
  );
}
