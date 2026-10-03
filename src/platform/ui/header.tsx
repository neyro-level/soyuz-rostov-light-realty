export type NavItem = {
  label: string;
  href: string;
};

export function Header({
  brand,
  phone,
  items,
  ctaLabel,
}: {
  brand: string;
  phone?: string;
  items: NavItem[];
  ctaLabel: string;
}) {
  return (
    <header className="border-b border-border bg-surface px-md py-sm">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <p className="text-fg font-medium">{brand}</p>
        <nav className="flex flex-wrap gap-md" aria-label="Main">
          {items.map((item) => (
            <a className="text-muted" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-md">
          {phone ? <p className="text-fg">{phone}</p> : null}
          <span className="rounded-sm bg-accent px-md py-sm text-accent-fg">
            {ctaLabel}
          </span>
        </div>
      </div>
    </header>
  );
}
