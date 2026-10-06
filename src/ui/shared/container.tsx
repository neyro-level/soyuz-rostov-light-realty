import type { ReactNode } from "react";
import { cn } from "@/ui/lib/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[var(--sr-container-max)]",
        className,
      )}
      style={{
        paddingInline:
          "max(var(--sr-container-padding-mobile), env(safe-area-inset-left))",
      }}
    >
      {children}
    </div>
  );
}
