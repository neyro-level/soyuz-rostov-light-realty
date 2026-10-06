export type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className ?? "px-md py-sm"}>
      <ol className="flex flex-wrap gap-sm text-muted">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.href ? (
              <a className="text-muted" href={item.href}>
                {item.label}
              </a>
            ) : (
              <span className="text-fg">{item.label}</span>
            )}
            {index < items.length - 1 ? (
              <span aria-hidden="true"> / </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
