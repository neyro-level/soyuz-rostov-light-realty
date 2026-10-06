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
    <article className="rounded-md border border-border bg-surface p-md shadow-card">
      <h2 className="text-fg">
        <a className="text-fg" href={href}>
          {title}
        </a>
      </h2>
      <p className="mt-sm text-muted">{meta}</p>
    </article>
  );
}
