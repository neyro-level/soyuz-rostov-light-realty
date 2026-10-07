import type { ReactNode } from "react";
import { cn } from "@/ui/lib/utils";

const widths = {
  site: "max-w-site",
  narrow: "max-w-narrow",
  wide: "max-w-wide",
} as const;

export function Container({
  children,
  className,
  width = "site",
}: {
  children: ReactNode;
  className?: string;
  width?: keyof typeof widths;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 md:px-8 lg:px-12",
        widths[width],
        className,
      )}
    >
      {children}
    </div>
  );
}
