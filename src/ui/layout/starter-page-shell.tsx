import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/ui/layout/breadcrumbs";
import { Container } from "@/ui/shared/container";
import { Section } from "@/ui/shared/section";

export type StarterPageShellProps = {
  breadcrumbs?: Crumb[];
  title: string;
  lead: string;
  cta?: ReactNode;
  children?: ReactNode;
};

/**
 * Starter layout for routes before full marketing design (max two meaning blocks).
 */
export function StarterPageShell({
  breadcrumbs,
  title,
  lead,
  cta,
  children,
}: StarterPageShellProps) {
  return (
    <main className="flex-1">
      <Section>
        <Container className="px-[var(--sr-container-padding-mobile)] md:px-[var(--sr-container-padding-tablet)] lg:px-[var(--sr-container-padding-desktop)]">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <Breadcrumbs
              className="mb-[var(--sr-space-md)] py-0"
              items={breadcrumbs}
            />
          ) : null}
          <header className="max-w-3xl">
            <h1 className="mb-[var(--sr-space-md)] font-semibold text-[length:var(--sr-h1-size)] leading-[var(--sr-h1-line)] text-[var(--sr-foreground)]">
              {title}
            </h1>
            <p className="mb-[var(--sr-space-lg)] text-[length:var(--sr-body-lg-size)] leading-relaxed text-[var(--sr-muted-foreground)]">
              {lead}
            </p>
            {cta ? <div className="mb-[var(--sr-space-md)]">{cta}</div> : null}
          </header>
        </Container>
      </Section>
      {children ? (
        <Section tone="soft">
          <Container className="px-[var(--sr-container-padding-mobile)] md:px-[var(--sr-container-padding-tablet)] lg:px-[var(--sr-container-padding-desktop)]">
            {children}
          </Container>
        </Section>
      ) : null}
    </main>
  );
}
