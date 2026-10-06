import type { NavItem } from "./header";

export function Footer({
  columns,
  legal,
  copyright,
}: {
  columns: Array<{ title: string; items: NavItem[] }>;
  legal: string;
  copyright: string;
}) {
  return (
    <footer className="mt-auto border-t border-border bg-surface px-md py-lg">
      <div className="grid gap-lg md:grid-cols-3">
        {columns.map((column) => (
          <section key={column.title}>
            <h2 className="mb-sm text-fg">{column.title}</h2>
            <ul className="flex flex-col gap-sm">
              {column.items.map((item) => (
                <li key={item.href}>
                  <a className="text-muted" href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-lg text-muted">{legal}</p>
      <p className="mt-sm text-muted">{copyright}</p>
    </footer>
  );
}
