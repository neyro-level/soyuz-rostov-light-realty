import type { ReactNode } from "react";
import { cn } from "@/ui/lib/utils";

export function ImageFrame({
  children,
  className,
  aspect = "16/9",
}: {
  children: ReactNode;
  className?: string;
  aspect?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md bg-[var(--sr-surface-base)]",
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      {children}
    </div>
  );
}
