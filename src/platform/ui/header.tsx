export type NavItem = {
  label: string;
  href: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export function Header({
  brand,
  phone,
  groups,
  ctaLabel,
  ctaHref,
}: {
  brand: string;
  phone?: string;
  groups: NavGroup[];
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <header className="border-b border-border bg-surface px-md py-sm">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <p className="text-fg font-medium">{brand}</p>
        <nav className="flex flex-wrap gap-md" aria-label="Main">
          {groups.map((group) => (
            <details className="relative" key={group.title}>
              <summary className="cursor-pointer text-fg">
                {group.title}
              </summary>
              <ul className="mt-sm flex flex-col gap-sm">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <a className="text-muted" href={item.href}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>
        <div className="flex items-center gap-md">
          {phone ? <p className="text-fg">{phone}</p> : null}
          <a
            className="rounded-sm bg-accent px-md py-sm text-accent-fg"
            href={ctaHref}
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
