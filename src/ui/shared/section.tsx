import type { ReactNode } from "react";
import { cn } from "@/ui/lib/utils";

export function Section({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "soft" | "primary";
}) {
  const bg =
    tone === "soft"
      ? "bg-[var(--sr-surface-soft)]"
      : tone === "primary"
        ? "bg-[var(--sr-surface-primary)]"
        : "bg-[var(--sr-background)]";
  return (
    <section
      className={cn(
        bg,
        "py-[var(--sr-section-md-mobile)] md:py-[var(--sr-section-md-desktop)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
