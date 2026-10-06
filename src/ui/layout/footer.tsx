import type { NavGroup } from "@/platform/nav";
import { Container } from "@/ui/shared/container";

const footerLinkClass =
  "inline-flex min-h-11 items-center text-[var(--sr-muted-on-dark)] transition-colors hover:text-[var(--sr-foreground-on-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sr-foreground-on-dark)]";

export function Footer({
  brand,
  homeHref,
  phoneDisplay,
  phoneTel,
  email,
  address,
  hoursDisplay,
  columns,
  requisites,
  copyright,
}: {
  brand: string;
  homeHref: string;
  phoneDisplay: string;
  phoneTel: string;
  email: string;
  address: string;
  hoursDisplay: string;
  columns: NavGroup[];
  requisites: string;
  copyright: string;
}) {
  return (
    <footer
      className="mt-auto bg-[var(--sr-surface-dark)] text-[var(--sr-foreground-on-dark)]"
    >
      <Container
        className="px-[var(--sr-container-padding-mobile)] md:px-[var(--sr-container-padding-tablet)] lg:px-[var(--sr-container-padding-desktop)]"
      >
        <div
          className="grid gap-[var(--sr-space-xl)] py-[var(--sr-section-md-mobile)] md:py-[var(--sr-section-md-desktop)]"
        >
          <div
            className="grid gap-[var(--sr-space-xl)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          >
            <section className="sm:col-span-2 xl:col-span-1">
              <a
                className="inline-flex min-h-11 items-center font-semibold text-[var(--sr-foreground-on-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sr-foreground-on-dark)]"
                href={homeHref}
              >
                {brand}
              </a>
              <address
                className="mt-[var(--sr-space-md)] flex flex-col gap-[var(--sr-space-sm)] not-italic text-sm text-[var(--sr-muted-on-dark)]"
              >
                <span>{address}</span>
                <a className={footerLinkClass} href={`tel:${phoneTel}`}>
                  {phoneDisplay}
                </a>
                <a className={footerLinkClass} href={`mailto:${email}`}>
                  {email}
                </a>
                <span>{hoursDisplay}</span>
              </address>
            </section>
            {columns.map((column) => (
              <section key={column.title}>
                <h2
                  className="mb-[var(--sr-space-sm)] text-xs font-medium uppercase tracking-wide text-[rgb(255_255_255/0.4)]"
                >
                  {column.title}
                </h2>
                <ul className="flex flex-col gap-[var(--sr-space-xs)]">
                  {column.items.map((item) => (
                    <li key={item.href}>
                      <a className={footerLinkClass} href={item.href}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <div
            className="border-t border-[var(--sr-border-dark)] pt-[var(--sr-space-lg)]"
          >
            <p className="text-sm leading-relaxed text-[var(--sr-muted-on-dark)]">
              {requisites}
            </p>
            <p
              className="mt-[var(--sr-space-sm)] text-sm text-[rgb(255_255_255/0.4)]"
            >
              {copyright}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
