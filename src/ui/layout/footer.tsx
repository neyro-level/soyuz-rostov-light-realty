import type { NavGroup } from "@/platform/nav";
import { Container } from "@/ui/shared/container";

const footerLinkClass =
  "inline-flex min-h-11 items-center text-muted-on-dark transition-colors hover:text-foreground-on-dark focus-visible:outline-none focus-visible:shadow-focus";

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
    <footer className="mt-auto bg-surface-dark text-foreground-on-dark">
      <Container>
        <div className="grid gap-xl py-section-md md:py-section-md-desktop">
          <div className="grid gap-xl sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <section className="sm:col-span-2 xl:col-span-1">
              <a
                className="inline-flex min-h-11 items-center font-semibold text-foreground-on-dark focus-visible:outline-none focus-visible:shadow-focus"
                href={homeHref}
              >
                {brand}
              </a>
              <address className="mt-md flex flex-col gap-sm not-italic text-sm text-muted-on-dark">
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
                <h2 className="mb-sm text-xs font-medium uppercase tracking-wide text-label-on-dark">
                  {column.title}
                </h2>
                <ul className="flex flex-col gap-xs">
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
          <div className="border-t border-border-dark pt-lg">
            <p className="text-sm leading-relaxed text-muted-on-dark">
              {requisites}
            </p>
            <p className="mt-sm text-sm text-label-on-dark">{copyright}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
