import type { NavGroup } from "./header";

export function MobileNavigation({
  groups,
  open,
}: {
  groups: NavGroup[];
  open: boolean;
}) {
  if (!open) {
    return null;
  }
  return (
    <nav className="border-b border-border bg-surface px-md py-sm md:hidden">
      <ul className="flex flex-col gap-sm">
        {groups.flatMap((group) =>
          group.items.map((item) => (
            <li key={item.href}>
              <a className="text-fg" href={item.href}>
                {item.label}
              </a>
            </li>
          )),
        )}
      </ul>
    </nav>
  );
}
