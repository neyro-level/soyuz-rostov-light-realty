export function DevelopmentCard({
  title,
  meta,
  href,
  priceLabel,
}: {
  title: string;
  meta: string;
  href: string;
  priceLabel?: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-md border border-[var(--sr-border)] bg-[var(--sr-card)] p-[var(--sr-space-md)] shadow-[var(--sr-shadow-card)]">
      <div
        aria-hidden
        className="mb-[var(--sr-space-md)] aspect-[4/3] rounded-md bg-[var(--sr-surface-primary-strong)]"
      />
      <h3 className="font-semibold text-[var(--sr-foreground)]">
        <a
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sr-primary)]"
          href={href}
        >
          {title}
        </a>
      </h3>
      <p className="mt-[var(--sr-space-xs)] text-sm text-[var(--sr-muted-foreground)]">
        {meta}
      </p>
      {priceLabel ? (
        <p className="mt-[var(--sr-space-sm)] font-medium text-[var(--sr-foreground)]">
          {priceLabel}
        </p>
      ) : null}
    </article>
  );
}
