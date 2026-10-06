import { cn } from "@/ui/lib/utils";

export function SectionHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <header className={cn("mb-[var(--sr-space-lg)]", className)}>
      <h2
        className="font-semibold text-[var(--sr-foreground)] text-[length:var(--sr-text-h2-mobile)] leading-[var(--sr-text-h2-leading)] md:text-[length:var(--sr-text-h2-tablet)] lg:text-[length:var(--sr-text-h2-desktop)]"
        style={{ fontWeight: "var(--sr-text-h2-weight)" }}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-[var(--sr-space-sm)] text-[var(--sr-muted-foreground)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
