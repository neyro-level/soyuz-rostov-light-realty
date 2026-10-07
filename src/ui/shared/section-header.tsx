import type { ReactNode } from "react";
import { cn } from "@/ui/lib/utils";

export function SectionHeader({
  title,
  description,
  eyebrow,
  action,
  className,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-lg flex flex-col gap-sm sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {eyebrow ? (
          <p className="text-label font-bold tracking-[0.08em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-h2 font-semibold leading-title text-balance text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-sm text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
