import { cn } from "@/lib/cn";

const PALETTE = [
  "bg-[#534AB7]",
  "bg-[#1D9E75]",
  "bg-[#C2410C]",
  "bg-[#0E7490]",
  "bg-[#A21CAF]",
  "bg-[#B45309]",
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorClass(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

const sizeMap = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        sizeMap[size],
        getColorClass(name || "?"),
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </span>
  );
}
