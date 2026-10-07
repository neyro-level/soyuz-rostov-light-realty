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
    <article className="flex h-full flex-col rounded-md border border-border bg-card p-md shadow-card">
      <div
        aria-hidden
        className="mb-md aspect-[4/3] rounded-md bg-surface-primary-strong"
      />
      <h3 className="font-semibold text-foreground">
        <a
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          href={href}
        >
          {title}
        </a>
      </h3>
      <p className="mt-xs text-sm text-muted-foreground">{meta}</p>
      {priceLabel ? (
        <p className="mt-sm font-medium text-foreground">{priceLabel}</p>
      ) : null}
    </article>
  );
}
