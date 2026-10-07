export function PropertyCard({
  title,
  meta,
  href,
}: {
  title: string;
  meta: string;
  href: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-md border border-border bg-card p-md shadow-card">
      <div
        aria-hidden
        className="mb-md aspect-[4/3] rounded-md bg-surface-soft"
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
    </article>
  );
}
